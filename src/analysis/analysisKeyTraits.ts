/**
 * Web `analysis-result.js` — aranan profil chip listesi (key_traits + tamamlayıcılar).
 */

const AR_SUPPLEMENTAL_KEY_TRAITS: string[] = [
  "Büyük ölçekli dağıtık sistemlerde tasarım ve operasyon deneyimi",
  "Takım içi kod incelemesi ve teknik karar dokümantasyonu",
  "Üretim ortamında gözlemlenebilirlik ve hata ayıklama disiplini",
  "Çevik ritimlere uyum ve önceliklendirilmiş teslimat",
  "Güvenlik ve veri gizliliği bilinciyle geliştirme",
  "Performans ve maliyet odaklı mühendislik trade-off'ları",
  "Sürekli öğrenme ve yeni teknolojileri kontrollü benimseme",
  "Paydaşlarla net iletişim ve teknik sunum becerisi",
  "Otomasyon, test ve kalite kapılarıyla sürdürülebilir pipeline",
  "Incident müdahalesi ve kök neden analizi deneyimi",
  "Domain modelleme ve sınır bağlam (bounded context) düşüncesi",
  "Erişilebilirlik ve kullanıcı deneyimiyle uyumlu arayüz kararları",
];

export function dedupeKeyTraits(arr: unknown[]): string[] {
  const seen: Record<string, boolean> = {};
  const out: string[] = [];
  (arr || []).forEach((t) => {
    const raw = String(t == null ? "" : t).trim();
    if (!raw) return;
    const k = raw.toLowerCase().replace(/\s+/g, " ");
    if (seen[k]) return;
    seen[k] = true;
    out.push(raw);
  });
  return out;
}

export function extendKeyTraits(traits: unknown[], minLen = 10): string[] {
  const out = dedupeKeyTraits(Array.isArray(traits) ? traits : []);
  if (out.length >= minLen) return out;
  const seen: Record<string, boolean> = {};
  out.forEach((t) => {
    seen[String(t).trim().toLowerCase().replace(/\s+/g, " ")] = true;
  });
  for (let i = 0; i < AR_SUPPLEMENTAL_KEY_TRAITS.length && out.length < minLen; i++) {
    const x = AR_SUPPLEMENTAL_KEY_TRAITS[i];
    const k = String(x).trim().toLowerCase().replace(/\s+/g, " ");
    if (seen[k]) continue;
    seen[k] = true;
    out.push(x);
  }
  return out;
}
