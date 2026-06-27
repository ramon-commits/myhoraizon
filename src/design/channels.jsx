/* Kanaal-adapter-laag (pluggbaar). De UI leest kanalen UITSLUITEND hieruit, niet
   hardcoded — zo klikt de echte Kyano-hub comms-engine later vast zonder ombouw.
   Per kanaal: label, icoon-key, accent, en het echte merklogo (de cirkel IS het
   kanaal). CH_LOGO/CH_META komen 1:1 uit de Claude Design-blauwdruk. */

export const CH_META = {
  wa: { label: "WhatsApp", icon: "wa", accent: "aqua" },
  gm: { label: "Gmail", icon: "gm", accent: "red" },
  li: { label: "LinkedIn", icon: "li", accent: "navy" },
  web: { label: "Website", icon: "globe", accent: "teal" },
};

/* echte merklogo's, de cirkel IS het kanaal */
export const CH_LOGO = {
  wa: { bg: "#25D366", svg: '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="#fff" d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347M12.05 21.785h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884"/></svg>' },
  gm: { bg: "#fff", border: true, svg: '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="#4285F4" d="M1.636 21h3.273v-9.273L0 7.909v11.455C0 20.27.732 21 1.636 21z"/><path fill="#34A853" d="M19.091 21h3.273c.904 0 1.636-.73 1.636-1.636V7.909l-4.909 3.818z"/><path fill="#FBBC04" d="M19.091 4.636v7.091L24 7.909V5.455c0-2.023-2.31-3.178-3.927-1.964z"/><path fill="#EA4335" d="M4.909 11.727V4.636L12 9.955l7.091-5.319v7.091L12 17.045z"/><path fill="#C5221F" d="M0 5.455v2.454l4.909 3.818V4.636L3.927 3.49C2.31 2.277 0 3.432 0 5.455z"/></svg>' },
  li: { bg: "#0A66C2", svg: '<svg viewBox="0 0 24 24" aria-hidden="true"><g fill="#fff"><rect x="4.3" y="9.7" width="3.3" height="9.6" rx=".3"/><circle cx="5.95" cy="6.3" r="1.95"/><path d="M9.6 9.7h3.15v1.32h.05c.45-.82 1.53-1.66 3.13-1.66 3.32 0 3.92 2.12 3.92 4.93v5.01h-3.3v-4.44c0-1.06-.02-2.42-1.48-2.42-1.48 0-1.71 1.15-1.71 2.34v4.52H9.6z"/></g></svg>' },
  web: { bg: "#2E8A84", svg: '<svg viewBox="0 0 24 24" aria-hidden="true"><g fill="none" stroke="#fff" stroke-width="1.7"><circle cx="12" cy="12" r="8.2"/><path d="M3.8 12h16.4M12 3.8c2.7 2.4 2.7 13.6 0 16.4M12 3.8c-2.7 2.4-2.7 13.6 0 16.4"/></g></svg>' },
};

export function ChannelAvatar({ ch, size = 44 }) {
  const c = CH_LOGO[ch];
  return <span className={"ch-avatar" + (c.border ? " light" : "")} style={{ width: size, height: size, background: c.bg }} title={CH_META[ch].label} dangerouslySetInnerHTML={{ __html: c.svg }} />;
}

/* Tenant-config-seam: per tenant kanalen aan/uit + volgorde, uit config i.p.v.
   hardcoded. Nu een simpel default-object; het brein klikt hier later op vast. */
export const INBOX_TENANT = {
  channels: ["gm", "wa", "li", "web"], // welke kanalen deze tenant gebruikt
};
export function tenantChannels(tenant = INBOX_TENANT) {
  return (tenant.channels || Object.keys(CH_META)).filter((k) => CH_META[k]);
}
