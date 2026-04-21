#!/usr/bin/env bash
set -euo pipefail

PROJECT_ID="${PROJECT_ID:-classic-same-day-blinds}"
REGION="${REGION:-us-central1}"
ZONE="${ZONE:-us-central1-a}"
NETWORK="${NETWORK:-default}"
AR_REPO="${AR_REPO:-cloud-run}"
SQL_INSTANCE="${SQL_INSTANCE:-blinds-postgres}"
SQL_DATABASE="${SQL_DATABASE:-blinds_commerce}"
SQL_USER="${SQL_USER:-blindsapp}"
REDIS_INSTANCE="${REDIS_INSTANCE:-blinds-redis}"
VPC_CONNECTOR="${VPC_CONNECTOR:-blinds-serverless}"
VPC_CONNECTOR_RANGE="${VPC_CONNECTOR_RANGE:-10.8.0.0/28}"
COMMERCE_SERVICE="${COMMERCE_SERVICE:-blinds-commerce}"
OPS_API_SERVICE="${OPS_API_SERVICE:-blinds-ops-api}"
STOREFRONT_SERVICE="${STOREFRONT_SERVICE:-blinds-storefront}"
TAG="${TAG:-$(date +%Y%m%d-%H%M%S)}"
DB_PASSWORD_SECRET="${DB_PASSWORD_SECRET:-blinds-db-password}"

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$ROOT_DIR"

if [[ ! -f .env ]]; then
  echo "Missing root .env file"
  exit 1
fi

while IFS= read -r raw_line || [[ -n "$raw_line" ]]; do
  line="${raw_line#"${raw_line%%[![:space:]]*}"}"
  line="${line%"${line##*[![:space:]]}"}"

  if [[ -z "$line" || "$line" == \#* || "$line" != *=* ]]; then
    continue
  fi

  key="${line%%=*}"
  value="${line#*=}"
  key="${key%"${key##*[![:space:]]}"}"
  value="${value#"${value%%[![:space:]]*}"}"

  export "$key=$value"
done < .env

require_env() {
  local name="$1"
  if [[ -z "${!name:-}" ]]; then
    echo "Missing required env: $name"
    exit 1
  fi
}

require_env NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY
require_env NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
require_env JWT_SECRET
require_env COOKIE_SECRET
require_env MEDUSA_ADMIN_EMAIL
require_env MEDUSA_ADMIN_PASSWORD
require_env STRIPE_SECRET_KEY
require_env STRIPE_WEBHOOK_SECRET

gcloud config set project "$PROJECT_ID" >/dev/null

echo "==> Enabling required APIs"
gcloud services enable \
  run.googleapis.com \
  artifactregistry.googleapis.com \
  cloudbuild.googleapis.com \
  secretmanager.googleapis.com \
  sqladmin.googleapis.com \
  redis.googleapis.com \
  vpcaccess.googleapis.com \
  --project "$PROJECT_ID" >/dev/null

echo "==> Ensuring Artifact Registry repository"
if ! gcloud artifacts repositories describe "$AR_REPO" --location "$REGION" --project "$PROJECT_ID" >/dev/null 2>&1; then
  gcloud artifacts repositories create "$AR_REPO" \
    --repository-format=docker \
    --location="$REGION" \
    --description="Cloud Run images for Classic Same Day Blinds" \
    --project "$PROJECT_ID"
fi

echo "==> Ensuring Serverless VPC connector"
if ! gcloud compute networks vpc-access connectors describe "$VPC_CONNECTOR" --region "$REGION" --project "$PROJECT_ID" >/dev/null 2>&1; then
  gcloud compute networks vpc-access connectors create "$VPC_CONNECTOR" \
    --region "$REGION" \
    --network "$NETWORK" \
    --range "$VPC_CONNECTOR_RANGE" \
    --min-instances 2 \
    --max-instances 3 \
    --project "$PROJECT_ID"
fi

echo "==> Ensuring DB password secret"
if ! gcloud secrets describe "$DB_PASSWORD_SECRET" --project "$PROJECT_ID" >/dev/null 2>&1; then
  DB_PASSWORD="$(node -e "console.log(require('crypto').randomBytes(24).toString('base64url'))")"
  printf "%s" "$DB_PASSWORD" | gcloud secrets create "$DB_PASSWORD_SECRET" \
    --data-file=- \
    --replication-policy=automatic \
    --project "$PROJECT_ID"
else
  DB_PASSWORD="$(gcloud secrets versions access latest --secret "$DB_PASSWORD_SECRET" --project "$PROJECT_ID")"
fi

echo "==> Ensuring Cloud SQL instance"
if ! gcloud sql instances describe "$SQL_INSTANCE" --project "$PROJECT_ID" >/dev/null 2>&1; then
  if ! gcloud sql instances create "$SQL_INSTANCE" \
    --database-version=POSTGRES_15 \
    --tier=db-f1-micro \
    --region="$REGION" \
    --root-password="$DB_PASSWORD" \
    --project "$PROJECT_ID"; then
    gcloud sql instances create "$SQL_INSTANCE" \
      --database-version=POSTGRES_15 \
      --tier=db-g1-small \
      --region="$REGION" \
      --root-password="$DB_PASSWORD" \
      --project "$PROJECT_ID"
  fi
fi

echo "==> Ensuring Cloud SQL database and user"
if ! gcloud sql databases describe "$SQL_DATABASE" --instance "$SQL_INSTANCE" --project "$PROJECT_ID" >/dev/null 2>&1; then
  gcloud sql databases create "$SQL_DATABASE" --instance "$SQL_INSTANCE" --project "$PROJECT_ID"
fi

if ! gcloud sql users list --instance "$SQL_INSTANCE" --project "$PROJECT_ID" --format='value(name)' | grep -qx "$SQL_USER"; then
  gcloud sql users create "$SQL_USER" --instance "$SQL_INSTANCE" --password "$DB_PASSWORD" --project "$PROJECT_ID"
else
  gcloud sql users set-password "$SQL_USER" --instance "$SQL_INSTANCE" --password "$DB_PASSWORD" --project "$PROJECT_ID" >/dev/null
fi

INSTANCE_CONNECTION_NAME="$(gcloud sql instances describe "$SQL_INSTANCE" --project "$PROJECT_ID" --format='value(connectionName)')"
DB_SOCKET_URL="postgresql://${SQL_USER}:${DB_PASSWORD}@/${SQL_DATABASE}?host=/cloudsql/${INSTANCE_CONNECTION_NAME}"

echo "==> Ensuring Memorystore Redis"
if ! gcloud redis instances describe "$REDIS_INSTANCE" --region "$REGION" --project "$PROJECT_ID" >/dev/null 2>&1; then
  gcloud redis instances create "$REDIS_INSTANCE" \
    --region="$REGION" \
    --zone="$ZONE" \
    --network="$NETWORK" \
    --connect-mode=direct-peering \
    --redis-version=redis_7_0 \
    --size=1 \
    --tier=basic \
    --project "$PROJECT_ID"
fi

REDIS_HOST="$(gcloud redis instances describe "$REDIS_INSTANCE" --region "$REGION" --project "$PROJECT_ID" --format='value(host)')"
REDIS_PORT="$(gcloud redis instances describe "$REDIS_INSTANCE" --region "$REGION" --project "$PROJECT_ID" --format='value(port)')"
REDIS_URL="redis://${REDIS_HOST}:${REDIS_PORT}"

IMAGE_PREFIX="${REGION}-docker.pkg.dev/${PROJECT_ID}/${AR_REPO}"
RUNTIME_IMAGE="${IMAGE_PREFIX}/platform-runtime:${TAG}"

PLACEHOLDER_URL="https://placeholder.invalid"
TMP_DIR="$(mktemp -d)"
trap 'rm -rf "$TMP_DIR"' EXIT

build_image() {
  local image="$1"
  local dockerfile="$2"
  cat >"$TMP_DIR/cloudbuild-runtime.yaml" <<EOF
steps:
  - name: gcr.io/cloud-builders/docker
    args:
      - build
      - -f
      - ${dockerfile}
      - -t
      - ${image}
      - .
images:
  - ${image}
EOF

  gcloud builds submit . \
    --project "$PROJECT_ID" \
    --config "$TMP_DIR/cloudbuild-runtime.yaml"
}

write_commerce_env() {
  local backend_url="$1"
  local store_cors="$2"
  local admin_cors="$3"
  local auth_cors="$4"
  local ops_api_base_url="$5"
  cat >"$TMP_DIR/commerce-env.yaml" <<EOF
NODE_ENV: production
DATABASE_URL: "$DB_SOCKET_URL"
REDIS_URL: "$REDIS_URL"
JWT_SECRET: "$JWT_SECRET"
COOKIE_SECRET: "$COOKIE_SECRET"
MEDUSA_BACKEND_URL: "$backend_url"
MEDUSA_ADMIN_PATH: "${MEDUSA_ADMIN_PATH:-/app}"
STORE_CORS: "$store_cors"
ADMIN_CORS: "$admin_cors"
AUTH_CORS: "$auth_cors"
OPS_API_BASE_URL: "$ops_api_base_url"
STRIPE_SECRET_KEY: "$STRIPE_SECRET_KEY"
STRIPE_WEBHOOK_SECRET: "$STRIPE_WEBHOOK_SECRET"
GCS_BUCKET_NAME: "${GCS_BUCKET_NAME:-}"
GCS_ACCESS_KEY_ID: "${GCS_ACCESS_KEY_ID:-}"
GCS_SECRET_ACCESS_KEY: "${GCS_SECRET_ACCESS_KEY:-}"
GCS_REGION: "${GCS_REGION:-us-central1}"
EOF
}

write_ops_env() {
  local medusa_url="$1"
  local storefront_url="$2"
  cat >"$TMP_DIR/ops-api-env.yaml" <<EOF
NODE_ENV: production
OPS_API_HOST: "0.0.0.0"
OPS_API_PORT: "8080"
OPS_DATABASE_URL: "$DB_SOCKET_URL"
OPS_API_ALLOWED_ORIGINS: "$storefront_url,$medusa_url"
MEDUSA_BACKEND_URL: "$medusa_url"
STOREFRONT_URL: "$storefront_url"
MEDUSA_PUBLISHABLE_KEY: "$NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY"
MEDUSA_ADMIN_EMAIL: "$MEDUSA_ADMIN_EMAIL"
MEDUSA_ADMIN_PASSWORD: "$MEDUSA_ADMIN_PASSWORD"
STRIPE_SECRET_KEY: "$STRIPE_SECRET_KEY"
RESEND_API_KEY: "${RESEND_API_KEY:-}"
EMAIL_FROM: "${EMAIL_FROM:-orders@classicsamedayblinds.local}"
EMAIL_ADMIN_RECIPIENTS: "${EMAIL_ADMIN_RECIPIENTS:-ops@classicsamedayblinds.local}"
INTERNAL_API_SECRET: "${INTERNAL_API_SECRET:-}"
GOOGLE_PLACES_API_KEY: "${GOOGLE_PLACES_API_KEY:-}"
GOOGLE_PLACE_ID: "${GOOGLE_PLACE_ID:-}"
LLM_PROVIDER: "${LLM_PROVIDER:-}"
VERTEX_PROJECT_ID: "${VERTEX_PROJECT_ID:-}"
VERTEX_LOCATION: "${VERTEX_LOCATION:-}"
VERTEX_MODEL: "${VERTEX_MODEL:-}"
EOF
}

write_storefront_env() {
  local medusa_url="$1"
  local ops_url="$2"
  cat >"$TMP_DIR/storefront-env.yaml" <<EOF
NODE_ENV: production
NEXT_PUBLIC_MEDUSA_BACKEND_URL: "$medusa_url"
NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY: "$NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY"
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: "$NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY"
NEXT_PUBLIC_OPS_API_URL: "$ops_url"
NEXT_PUBLIC_CHAT_SERVICE_URL: "${NEXT_PUBLIC_CHAT_SERVICE_URL:-}"
GOOGLE_PLACES_API_KEY: "${GOOGLE_PLACES_API_KEY:-}"
GOOGLE_PLACE_ID: "${GOOGLE_PLACE_ID:-}"
NEXT_PUBLIC_GOOGLE_PLACE_URL: "${NEXT_PUBLIC_GOOGLE_PLACE_URL:-}"
EOF
}

echo "==> Building container images"
build_image "$RUNTIME_IMAGE" "infra/cloud-run/Dockerfile.runtime"

echo "==> Deploying commerce (pass 1)"
write_commerce_env "$PLACEHOLDER_URL" "$PLACEHOLDER_URL" "$PLACEHOLDER_URL" "$PLACEHOLDER_URL" "$PLACEHOLDER_URL"
gcloud run deploy "$COMMERCE_SERVICE" \
  --image "$RUNTIME_IMAGE" \
  --region "$REGION" \
  --project "$PROJECT_ID" \
  --allow-unauthenticated \
  --port 8080 \
  --command sh \
  --args="-c,PORT=\${PORT:-8080} npm run db:migrate -w @blinds/commerce && npm run start -w @blinds/commerce" \
  --add-cloudsql-instances "$INSTANCE_CONNECTION_NAME" \
  --vpc-connector "$VPC_CONNECTOR" \
  --vpc-egress private-ranges-only \
  --env-vars-file "$TMP_DIR/commerce-env.yaml"

COMMERCE_URL="$(gcloud run services describe "$COMMERCE_SERVICE" --region "$REGION" --project "$PROJECT_ID" --format='value(status.url)')"

echo "==> Deploying ops-api (pass 1)"
write_ops_env "$COMMERCE_URL" "$PLACEHOLDER_URL"
gcloud run deploy "$OPS_API_SERVICE" \
  --image "$RUNTIME_IMAGE" \
  --region "$REGION" \
  --project "$PROJECT_ID" \
  --allow-unauthenticated \
  --port 8080 \
  --command sh \
  --args="-c,PORT=\${PORT:-8080} npm run start -w @blinds/ops-api" \
  --add-cloudsql-instances "$INSTANCE_CONNECTION_NAME" \
  --env-vars-file "$TMP_DIR/ops-api-env.yaml"

OPS_API_URL="$(gcloud run services describe "$OPS_API_SERVICE" --region "$REGION" --project "$PROJECT_ID" --format='value(status.url)')"

echo "==> Deploying storefront"
write_storefront_env "$COMMERCE_URL" "$OPS_API_URL"
gcloud run deploy "$STOREFRONT_SERVICE" \
  --image "$RUNTIME_IMAGE" \
  --region "$REGION" \
  --project "$PROJECT_ID" \
  --allow-unauthenticated \
  --port 8080 \
  --command sh \
  --args="-c,npm run start -w @blinds/storefront -- --hostname 0.0.0.0 -p \${PORT:-8080}" \
  --env-vars-file "$TMP_DIR/storefront-env.yaml"

STOREFRONT_URL="$(gcloud run services describe "$STOREFRONT_SERVICE" --region "$REGION" --project "$PROJECT_ID" --format='value(status.url)')"

echo "==> Updating commerce and ops-api with final URLs"
write_commerce_env "$COMMERCE_URL" "$STOREFRONT_URL" "$COMMERCE_URL" "${STOREFRONT_URL},${COMMERCE_URL}" "$OPS_API_URL"
gcloud run deploy "$COMMERCE_SERVICE" \
  --image "$RUNTIME_IMAGE" \
  --region "$REGION" \
  --project "$PROJECT_ID" \
  --allow-unauthenticated \
  --port 8080 \
  --command sh \
  --args="-c,PORT=\${PORT:-8080} npm run db:migrate -w @blinds/commerce && npm run start -w @blinds/commerce" \
  --add-cloudsql-instances "$INSTANCE_CONNECTION_NAME" \
  --vpc-connector "$VPC_CONNECTOR" \
  --vpc-egress private-ranges-only \
  --env-vars-file "$TMP_DIR/commerce-env.yaml"

write_ops_env "$COMMERCE_URL" "$STOREFRONT_URL"
gcloud run deploy "$OPS_API_SERVICE" \
  --image "$RUNTIME_IMAGE" \
  --region "$REGION" \
  --project "$PROJECT_ID" \
  --allow-unauthenticated \
  --port 8080 \
  --command sh \
  --args="-c,PORT=\${PORT:-8080} npm run start -w @blinds/ops-api" \
  --add-cloudsql-instances "$INSTANCE_CONNECTION_NAME" \
  --env-vars-file "$TMP_DIR/ops-api-env.yaml"

echo "==> Deployment complete"
echo "Storefront: $STOREFRONT_URL"
echo "Commerce:   $COMMERCE_URL"
echo "Ops API:    $OPS_API_URL"
echo "Cloud SQL:  $INSTANCE_CONNECTION_NAME"
echo "Redis:      $REDIS_URL"
