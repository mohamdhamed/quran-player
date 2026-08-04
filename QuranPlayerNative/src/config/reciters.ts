/**
 * إعدادات القراء
 */

export interface Reciter {
    id: string;
    name: string;
    nameEn: string;
    country: string;
    style?: string;
}

export const RECITERS: Reciter[] = [
    {
        id: 'mishary',
        name: 'مشاري راشد العفاسي',
        nameEn: 'Mishary Rashid Alafasy',
        country: 'الكويت',
        style: 'مرتل',
    },
    {
        id: 'abdulbasit',
        name: 'عبد الباسط عبد الصمد',
        nameEn: 'Abdul Basit Abdul Samad',
        country: 'مصر',
        style: 'مجود',
    },
    {
        id: 'husary',
        name: 'محمود خليل الحصري',
        nameEn: 'Mahmoud Khalil Al-Hussary',
        country: 'مصر',
        style: 'معلم',
    },
    {
        id: 'minshawi',
        name: 'محمد صديق المنشاوي',
        nameEn: 'Mohamed Siddiq Al-Minshawi',
        country: 'مصر',
        style: 'مجود',
    },
    {
        id: 'sudais',
        name: 'عبد الرحمن السديس',
        nameEn: 'Abdul Rahman Al-Sudais',
        country: 'السعودية',
        style: 'إمام الحرم',
    },
    {
        id: 'shuraim',
        name: 'سعود الشريم',
        nameEn: 'Saud Al-Shuraim',
        country: 'السعودية',
        style: 'إمام الحرم',
    },
    {
        id: 'ghamadi',
        name: 'سعد الغامدي',
        nameEn: 'Saad Al-Ghamdi',
        country: 'السعودية',
        style: 'مرتل',
    },
    {
        id: 'ajmi',
        name: 'أحمد بن علي العجمي',
        nameEn: 'Ahmad Al-Ajmi',
        country: 'السعودية',
        style: 'مرتل',
    },
    {
        id: 'dosari',
        name: 'ياسر الدوسري',
        nameEn: 'Yasser Al-Dosari',
        country: 'السعودية',
        style: 'مرتل',
    },
];

export const getReciterById = (id: string): Reciter | undefined => {
    return RECITERS.find(r => r.id === id);
};
