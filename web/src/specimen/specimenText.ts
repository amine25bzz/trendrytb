/**
 * Static sample text for the design specimen only (P01). The real i18n system arrives in P04;
 * this file is not part of it. French and Arabic wording needs a native review (plan U9).
 */
export type SpecimenLang = 'en' | 'fr' | 'ar';

export const SPECIMEN_LANGS: readonly SpecimenLang[] = ['en', 'fr', 'ar'];

export function toSpecimenLang(value: string | null): SpecimenLang {
  return value === 'fr' || value === 'ar' ? value : 'en';
}

interface SpecimenText {
  readonly languageName: string;
  readonly title: string;
  readonly note: string;
  readonly languages: string;
  readonly sections: {
    readonly type: string;
    readonly mixed: string;
    readonly color: string;
    readonly ranks: string;
    readonly movement: string;
    readonly spacing: string;
    readonly icons: string;
    readonly focus: string;
    readonly table: string;
  };
  readonly sampleHeadline: string;
  readonly sampleBody: string;
  /**
   * Mixed-script lines. "{channel}" marks user content (a channel name in another script):
   * the specimen isolates it with <bdi> so it never flips the surrounding sentence.
   */
  readonly mixedSamples: readonly { readonly channel: string; readonly line: string }[];
  readonly color: {
    readonly token: string;
    readonly value: string;
    readonly pair: string;
    readonly use: string;
    readonly ratio: string;
    readonly minimum: string;
    readonly result: string;
    readonly pass: string;
    readonly fail: string;
    readonly reportOnly: string;
  };
  readonly ranksNote: string;
  readonly movement: {
    readonly up: (n: number) => string;
    readonly down: (n: number) => string;
    readonly same: string;
    readonly isNew: string;
    readonly newTag: string;
  };
  readonly focusButton: string;
  readonly focusLink: string;
  readonly focusNote: string;
  readonly table: {
    readonly caption: string;
    readonly rank: string;
    readonly video: string;
    readonly views: string;
    readonly published: string;
    readonly countries: string;
    readonly rows: readonly {
      readonly title: string;
      readonly channel: string;
      readonly age: string;
    }[];
  };
}

export const SPECIMEN_TEXT: Record<SpecimenLang, SpecimenText> = {
  en: {
    languageName: 'English',
    title: 'Design specimen',
    note: 'A static page for reviewing the design system. Everything here is sample content, not real data. Available in development, and in a build only with VITE_SPECIMEN=1.',
    languages: 'Language',
    sections: {
      type: 'Type scale',
      mixed: 'Mixed scripts and numbers',
      color: 'Color and contrast',
      ranks: 'Rank numerals and tabular figures',
      movement: 'Movement indicators',
      spacing: 'Spacing scale',
      icons: 'Icons',
      focus: 'Focus ring',
      table: 'Sample ruled table',
    },
    sampleHeadline: 'What is rising now in 20 countries',
    sampleBody: 'Ranks refresh every three hours. Compare a video across editions of the chart.',
    mixedSamples: [
      { channel: 'قناة الطبخ', line: '{channel} is #3 in MA and #7 in FR' },
      { channel: '', line: '1,284,903 views · 12:04 · Shorts' },
    ],
    color: {
      token: 'Token',
      value: 'Value',
      pair: 'Pair',
      use: 'Use',
      ratio: 'Ratio',
      minimum: 'Minimum',
      result: 'Result',
      pass: 'Pass',
      fail: 'Fail',
      reportOnly: 'Not enforced',
    },
    ranksNote: 'Digits share one width, so columns align by digit.',
    movement: {
      up: (n) => `up ${n} places`,
      down: (n) => `down ${n} places`,
      same: 'no change',
      isNew: 'new entry',
      newTag: 'NEW',
    },
    focusButton: 'Focusable button',
    focusLink: 'Focusable link',
    focusNote: 'Press Tab: every focusable element shows a 2px ink ring with a paper gap.',
    table: {
      caption: 'Sample rows (static, not real data)',
      rank: 'Rank',
      video: 'Video',
      views: 'Views',
      published: 'Published',
      countries: 'Countries',
      rows: [
        { title: 'Sample title of a rising video', channel: 'Sample channel', age: '3 h ago' },
        {
          title: 'Another sample title, slightly longer to show wrapping',
          channel: 'Second channel',
          age: '9 h ago',
        },
        { title: 'Third sample', channel: 'Third channel', age: '1 day ago' },
      ],
    },
  },
  fr: {
    languageName: 'Français',
    title: 'Spécimen de design',
    note: 'Une page statique pour revoir le système de design. Tout est un exemple, pas des données réelles. Disponible en développement, et dans un build seulement avec VITE_SPECIMEN=1.',
    languages: 'Langue',
    sections: {
      type: 'Échelle typographique',
      mixed: 'Écritures mélangées et nombres',
      color: 'Couleurs et contraste',
      ranks: 'Chiffres de classement et chiffres tabulaires',
      movement: 'Indicateurs de mouvement',
      spacing: 'Échelle d’espacement',
      icons: 'Icônes',
      focus: 'Anneau de focus',
      table: 'Tableau réglé d’exemple',
    },
    sampleHeadline: 'Ce qui monte en ce moment dans 20 pays',
    sampleBody:
      'Les classements se mettent à jour toutes les trois heures. Comparez une vidéo d’une édition du classement à l’autre.',
    mixedSamples: [
      { channel: 'قناة الطبخ', line: '{channel} est 3ᵉ au MA et 7ᵉ en FR' },
      { channel: '', line: '1 284 903 vues · 12:04 · Shorts' },
    ],
    color: {
      token: 'Jeton',
      value: 'Valeur',
      pair: 'Paire',
      use: 'Usage',
      ratio: 'Rapport',
      minimum: 'Minimum',
      result: 'Résultat',
      pass: 'Conforme',
      fail: 'Échec',
      reportOnly: 'Non imposé',
    },
    ranksNote:
      'Les chiffres ont tous la même largeur : les colonnes s’alignent chiffre par chiffre.',
    movement: {
      up: (n) => `en hausse de ${n} places`,
      down: (n) => `en baisse de ${n} places`,
      same: 'sans changement',
      isNew: 'nouvelle entrée',
      newTag: 'NOUVEAU',
    },
    focusButton: 'Bouton focalisable',
    focusLink: 'Lien focalisable',
    focusNote:
      'Appuyez sur Tab : chaque élément focalisable affiche un anneau encre de 2 px séparé par un espace papier.',
    table: {
      caption: 'Lignes d’exemple (statiques, pas de données réelles)',
      rank: 'Rang',
      video: 'Vidéo',
      views: 'Vues',
      published: 'Publiée',
      countries: 'Pays',
      rows: [
        {
          title: 'Titre d’exemple d’une vidéo qui monte',
          channel: 'Chaîne d’exemple',
          age: 'il y a 3 h',
        },
        {
          title: 'Un autre titre d’exemple, un peu plus long pour montrer le retour à la ligne',
          channel: 'Deuxième chaîne',
          age: 'il y a 9 h',
        },
        { title: 'Troisième exemple', channel: 'Troisième chaîne', age: 'il y a 1 jour' },
      ],
    },
  },
  ar: {
    languageName: 'العربية',
    title: 'عيّنة التصميم',
    note: 'صفحة ثابتة لمراجعة نظام التصميم. كل ما فيها أمثلة، وليست بيانات حقيقية. متاحة أثناء التطوير، وفي نسخة البناء فقط مع VITE_SPECIMEN=1.',
    languages: 'اللغة',
    sections: {
      type: 'سلّم أحجام الخط',
      mixed: 'نص مختلط وأرقام',
      color: 'الألوان والتباين',
      ranks: 'أرقام الترتيب والأرقام الجدولية',
      movement: 'مؤشرات الحركة',
      spacing: 'سلّم المسافات',
      icons: 'الأيقونات',
      focus: 'حلقة التركيز',
      table: 'جدول نموذجي مسطّر',
    },
    sampleHeadline: 'ما يصعد الآن في 20 دولة',
    sampleBody:
      'يتحدّث الترتيب كل ثلاث ساعات. قارن مقطعاً واحداً بين نسخ الترتيب في الدول المختلفة.',
    mixedSamples: [
      { channel: 'Tech Daily', line: 'قناة {channel} في المركز 3 في MA و7 في FR' },
      { channel: '', line: '1,284,903 مشاهدة · 12:04 · Shorts' },
    ],
    color: {
      token: 'الرمز',
      value: 'القيمة',
      pair: 'الزوج',
      use: 'الاستخدام',
      ratio: 'النسبة',
      minimum: 'الحد الأدنى',
      result: 'النتيجة',
      pass: 'ناجح',
      fail: 'راسب',
      reportOnly: 'غير مُلزِم',
    },
    ranksNote: 'كل الأرقام بعرض واحد، فتصطفّ الأعمدة رقماً تحت رقم.',
    movement: {
      up: (n) => `صعد ${n} مراكز`,
      down: (n) => (n === 2 ? 'نزل مركزين' : `نزل ${n} مراكز`),
      same: 'بلا تغيير',
      isNew: 'دخول جديد',
      newTag: 'جديد',
    },
    focusButton: 'زر قابل للتركيز',
    focusLink: 'رابط قابل للتركيز',
    focusNote:
      'اضغط Tab: يظهر حول كل عنصر قابل للتركيز إطار بلون الحبر بعرض 2px مع فاصل بلون الورق.',
    table: {
      caption: 'صفوف نموذجية (ثابتة، ليست بيانات حقيقية)',
      rank: 'الترتيب',
      video: 'المقطع',
      views: 'المشاهدات',
      published: 'النشر',
      countries: 'الدول',
      rows: [
        { title: 'عنوان نموذجي لمقطع صاعد', channel: 'قناة نموذجية', age: 'قبل 3 ساعات' },
        {
          title: 'عنوان نموذجي آخر أطول قليلاً لإظهار التفاف السطر',
          channel: 'القناة الثانية',
          age: 'قبل 9 ساعات',
        },
        { title: 'المثال الثالث', channel: 'القناة الثالثة', age: 'قبل يوم' },
      ],
    },
  },
};
