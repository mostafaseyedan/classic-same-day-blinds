import type {
  CompetitorPricingAlert,
  CompetitorPricingSummary,
  CompetitorProductMatch,
  CompetitorRefreshRun,
} from "@blinds/types";

function resolveAlertSeverity(match: CompetitorProductMatch): "critical" | undefined {
  // Only flag when our price is higher than the competitor's
  return match.priceDelta > 0 ? "critical" : undefined;
}

export function buildCompetitorAlerts(
  matches: CompetitorProductMatch[],
): CompetitorPricingAlert[] {
  return matches
    .filter((match) => resolveAlertSeverity(match) !== undefined)
    .map((match) => {
      const severity = resolveAlertSeverity(match)!;
      return {
        id: `alert_${match.id}`,
        matchId: match.id,
        severity,
        internalSku: match.internalSku,
        internalProductName: match.internalProductName,
        competitor: match.competitor,
        competitorProductName: match.competitorProductName,
        competitorUrl: match.competitorUrl,
        message:
          match.priceDelta > 0
            ? `Our price for ${match.sizeLabel} is $${match.priceDelta} above ${match.competitorProductName}.`
            : `${match.competitorProductName} is cheaper than our current price for ${match.sizeLabel}.`,
        sizeLabel: match.sizeLabel,
        priceDelta: match.priceDelta,
        lastCheckedAt: match.lastCheckedAt,
        storefrontSlug: match.storefrontSlug,
      };
    })
    .sort((left, right) => {
      if (left.severity !== right.severity) {
        return left.severity === "critical" ? -1 : 1;
      }
      return right.lastCheckedAt.localeCompare(left.lastCheckedAt);
    });
}

export function buildCompetitorSummary(
  matches: CompetitorProductMatch[],
  alerts: CompetitorPricingAlert[],
): CompetitorPricingSummary {
  const totalConfidence = matches.reduce((sum, match) => sum + match.confidence, 0);
  const lastRefreshAt = matches.reduce(
    (latest, match) => (match.lastCheckedAt > latest ? match.lastCheckedAt : latest),
    matches[0]?.lastCheckedAt ?? new Date(0).toISOString(),
  );

  return {
    totalMatches: matches.length,
    activeAlerts: alerts.length,
    criticalAlerts: alerts.filter((alert) => alert.severity === "critical").length,
    averageConfidence: matches.length ? totalConfidence / matches.length : 0,
    lastRefreshAt,
    staleMatches: matches.filter((match) => match.scrapeStatus !== "healthy").length,
  };
}

export function buildCompetitorRefreshRun(
  matches: CompetitorProductMatch[],
  alerts: CompetitorPricingAlert[],
): CompetitorRefreshRun {
  const startedAt = matches.reduce(
    (earliest, match) => (match.lastCheckedAt < earliest ? match.lastCheckedAt : earliest),
    matches[0]?.lastCheckedAt ?? new Date().toISOString(),
  );
  const completedAt = matches.reduce(
    (latest, match) => (match.lastCheckedAt > latest ? match.lastCheckedAt : latest),
    matches[0]?.lastCheckedAt ?? new Date().toISOString(),
  );
  const failures = matches.filter((match) => match.scrapeStatus === "failed").length;
  const degraded = matches.filter((match) => match.scrapeStatus === "degraded").length;

  return {
    id: "refresh_preview_2026_04_07",
    startedAt,
    completedAt,
    status: failures > 0 ? "failed" : degraded > 0 ? "degraded" : "healthy",
    matchesChecked: matches.length,
    alertsRaised: alerts.length,
    failures,
    notes: [],
  };
}
