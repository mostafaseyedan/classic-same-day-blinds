const fs = require('fs');
const file = '/home/mohammad_alsayyedan/Blinds/blinds/apps/storefront/src/app/account/page.tsx';
let content = fs.readFileSync(file, 'utf8');

// Imports
content = content.replace(
  'import { getPublicRuntimeConfig } from "@/lib/platform-config";',
  'import { getPublicRuntimeConfig } from "@/lib/platform-config";\nimport { Button } from "@/components/ui/button";\nimport { Input } from "@/components/ui/input";'
);

// View Orders / Sign in
content = content.replace(
  /<Link\s+href=\{isAuthenticated \? "\/orders" : "\/auth"\}\s+className="btn-primary"\s+>\s+\{isAuthenticated \? "View orders" : "Sign in"\}\s+<\/Link>/,
  `<Button asChild variant="default">\n              <Link href={isAuthenticated ? "/orders" : "/auth"}>\n                {isAuthenticated ? "View orders" : "Sign in"}\n              </Link>\n            </Button>`
);

// Profile Inputs
content = content.replace(/<input\n\s+type="text"\n\s+value=\{profileForm.first_name\}/g, `<Input\n                        type="text"\n                        value={profileForm.first_name}`);
content = content.replace(/className="field-input"\s+\/>/g, `/>`);
content = content.replace(/<input\n\s+type="text"\n\s+value=\{profileForm.last_name\}/g, `<Input\n                        type="text"\n                        value={profileForm.last_name}`);
content = content.replace(/<input\n\s+type="email"\n\s+value=\{customer.email\}\n\s+disabled\n\s+className="field-input text-slate\/60"\n\s+\/>/g, `<Input\n                        type="email"\n                        value={customer.email}\n                        disabled\n                        className="text-slate/60"\n                      />`);
content = content.replace(/<input\n\s+type="tel"\n\s+value=\{profileForm.phone\}/g, `<Input\n                        type="tel"\n                        value={profileForm.phone}`);
content = content.replace(/<input\n\s+type="text"\n\s+value=\{profileForm.company_name\}/g, `<Input\n                      type="text"\n                      value={profileForm.company_name}`);

// Save Profile button
content = content.replace(
  /<button\n\s+type="submit"\n\s+disabled=\{isSaving\}\n\s+className="btn-primary mt-5 disabled:opacity-70"\n\s+>\n\s+\{isSaving \? "Saving..." : "Save profile"\}\n\s+<\/button>/,
  `<Button\n                    type="submit"\n                    disabled={isSaving}\n                    variant="default"\n                    className="mt-5"\n                  >\n                    {isSaving ? "Saving..." : "Save profile"}\n                  </Button>`
);

// Remove button
content = content.replace(
  /<button\n\s+type="button"\n\s+onClick=\{() => void handleRemovePaymentMethod\(method.id\)\}\n\s+disabled=\{isRemovingPaymentMethod === method.id\}\n\s+className="btn-secondary px-4 py-2 text-xs hover:border-red-400 hover:text-red-700 disabled:opacity-60"\n\s+>/g,
  `<Button\n                              type="button"\n                              variant="secondary"\n                              onClick={() => void handleRemovePaymentMethod(method.id)}\n                              disabled={isRemovingPaymentMethod === method.id}\n                              className="px-4 py-2 text-xs hover:border-red-400 hover:text-red-700"\n                            >`
);
content = content.replace(/Removing\.\.\." : "Remove"\}\n\s+<\/button>/g, `Removing..." : "Remove"}\n                            </Button>`);

// Delete address button
content = content.replace(
  /<button\n\s+type="button"\n\s+onClick=\{() => void handleDeleteAddress\(address.id\)\}\n\s+className="btn-secondary mt-3 px-4 py-2 text-xs hover:border-red-400 hover:text-red-700"\n\s+>\n\s+Delete\n\s+<\/button>/g,
  `<Button\n                            type="button"\n                            variant="secondary"\n                            onClick={() => void handleDeleteAddress(address.id)}\n                            className="mt-3 px-4 py-2 text-xs hover:border-red-400 hover:text-red-700"\n                          >\n                            Delete\n                          </Button>`
);

// Address form inputs
content = content.replace(/<input\n\s+value=\{addressForm.first_name\}/g, `<Input\n                          value={addressForm.first_name}`);
content = content.replace(/<input\n\s+value=\{addressForm.last_name\}/g, `<Input\n                          value={addressForm.last_name}`);
content = content.replace(/<input\n\s+value=\{addressForm.address_1\}/g, `<Input\n                        value={addressForm.address_1}`);
content = content.replace(/<input\n\s+value=\{addressForm.city\}/g, `<Input\n                          value={addressForm.city}`);
content = content.replace(/<input\n\s+value=\{addressForm.province\}/g, `<Input\n                          value={addressForm.province}`);
content = content.replace(/<input\n\s+value=\{addressForm.postal_code\}/g, `<Input\n                          value={addressForm.postal_code}`);

// Address form submit
content = content.replace(
  /<button\n\s+type="submit"\n\s+disabled=\{isSaving\}\n\s+className="btn-secondary disabled:opacity-70"\n\s+>\n\s+\{isSaving \? "Saving..." : "Add address"\}\n\s+<\/button>/,
  `<Button\n                      type="submit"\n                      disabled={isSaving}\n                      variant="secondary"\n                    >\n                      {isSaving ? "Saving..." : "Add address"}\n                    </Button>`
);

// Links
content = content.replace(
  /<Link\n\s+href="\/quote"\n\s+className="btn-primary"\n\s+>\n\s+New quote\n\s+<\/Link>\n\s+<Link\n\s+href="\/checkout"\n\s+className="btn-secondary"\n\s+>\n\s+Request invoice from checkout\n\s+<\/Link>/,
  `<Button asChild variant="default">\n                      <Link href="/quote">\n                        New quote\n                      </Link>\n                    </Button>\n                    <Button asChild variant="secondary">\n                      <Link href="/checkout">\n                        Request invoice from checkout\n                      </Link>\n                    </Button>`
);

// Danger zone
content = content.replace(
  /<button\n\s+type="button"\n\s+onClick=\{() => void handleDelete\(\)\}\n\s+disabled=\{isSubmitting\}\n\s+className="btn-primary text-sm disabled:opacity-70"\n\s+>\n\s+\{isSubmitting \? "Submitting\.\.\." : "Yes, request deletion"\}\n\s+<\/button>/,
  `<Button\n                type="button"\n                variant="default"\n                onClick={() => void handleDelete()}\n                disabled={isSubmitting}\n                className="text-sm"\n              >\n                {isSubmitting ? "Submitting..." : "Yes, request deletion"}\n              </Button>`
);

content = content.replace(
  /<button\n\s+type="button"\n\s+onClick=\{() => setConfirming\(false\)\}\n\s+className="btn-secondary text-sm"\n\s+>\n\s+Cancel\n\s+<\/button>/,
  `<Button\n                type="button"\n                variant="secondary"\n                onClick={() => setConfirming(false)}\n                className="text-sm"\n              >\n                Cancel\n              </Button>`
);

content = content.replace(
  /<button\n\s+type="button"\n\s+onClick=\{() => setConfirming\(true\)\}\n\s+className="btn-secondary mt-4 text-sm"\n\s+>\n\s+Request account deletion\n\s+<\/button>/,
  `<Button\n              type="button"\n              variant="secondary"\n              onClick={() => setConfirming(true)}\n              className="mt-4 text-sm"\n            >\n              Request account deletion\n            </Button>`
);

fs.writeFileSync(file, content, 'utf8');
console.log("Replaced!");
