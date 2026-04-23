import { useLanguage } from '../../../contexts/LanguageContext';

const INCHES_MIN = 10;
const INCHES_MAX = 144;

const EIGHTHS_OPTIONS = [
  { label: '0/0', value: '0/0' },
  { label: '1/8', value: '1/8' },
  { label: '2/8', value: '2/8' },
  { label: '3/8', value: '3/8' },
  { label: '4/8', value: '4/8' },
  { label: '5/8', value: '5/8' },
  { label: '6/8', value: '6/8' },
  { label: '7/8', value: '7/8' },
];

interface DimensionRowProps {
  label: string;
  icon: string;
  inches: number;
  eighths: string;
  onInchesChange: (val: number) => void;
  onEighthsChange: (val: string) => void;
}

function DimensionRow({
  label,
  icon,
  inches,
  eighths,
  onInchesChange,
  onEighthsChange,
}: DimensionRowProps) {
  return (
    <div className="flex items-center gap-4">
      {/* Label */}
      <div className="w-20 shrink-0 flex items-center gap-2">
        <span className="text-base font-bold text-gray-800">{label}</span>
        <div className="w-5 h-5 flex items-center justify-center text-gray-500 shrink-0">
          <i className={`${icon} text-base`}></i>
        </div>
      </div>

      {/* Inches dropdown */}
      <div className="flex flex-col gap-0.5 flex-1">
        <span className="text-xs text-gray-400 font-medium">Inches</span>
        <select
          value={inches}
          onChange={(e) => onInchesChange(Number(e.target.value))}
          className="border border-gray-300 rounded-md px-3 py-2 text-sm font-semibold text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-green-600 cursor-pointer"
        >
          {Array.from({ length: INCHES_MAX - INCHES_MIN + 1 }, (_, i) => INCHES_MIN + i).map((in_) => (
            <option key={in_} value={in_}>
              {in_}
            </option>
          ))}
        </select>
      </div>

      {/* Eighths dropdown */}
      <div className="flex flex-col gap-0.5 flex-1">
        <span className="text-xs text-gray-400 font-medium">Eighths</span>
        <select
          value={eighths}
          onChange={(e) => onEighthsChange(e.target.value)}
          className="border border-gray-300 rounded-md px-3 py-2 text-sm font-semibold text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-green-600 cursor-pointer"
        >
          {EIGHTHS_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}

interface DimensionSelectorProps {
  widthInches: number;
  widthEighths: string;
  heightInches: number;
  heightEighths: string;
  onWidthInchesChange: (val: number) => void;
  onWidthEighthsChange: (val: string) => void;
  onHeightInchesChange: (val: number) => void;
  onHeightEighthsChange: (val: string) => void;
}

export default function DimensionSelector({
  widthInches,
  widthEighths,
  heightInches,
  heightEighths,
  onWidthInchesChange,
  onWidthEighthsChange,
  onHeightInchesChange,
  onHeightEighthsChange,
}: DimensionSelectorProps) {
  const { language } = useLanguage();

  return (
    <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 space-y-4">
      <p className="text-sm font-bold text-gray-800">
        {language === 'es' ? 'Medidas Personalizadas' : 'Custom Dimensions'}
      </p>

      <DimensionRow
        label={language === 'es' ? 'Ancho' : 'Width'}
        icon="ri-arrows-left-right-line"
        inches={widthInches}
        eighths={widthEighths}
        onInchesChange={onWidthInchesChange}
        onEighthsChange={onWidthEighthsChange}
      />

      <DimensionRow
        label={language === 'es' ? 'Alto' : 'Height'}
        icon="ri-arrow-up-down-line"
        inches={heightInches}
        eighths={heightEighths}
        onInchesChange={onHeightInchesChange}
        onEighthsChange={onHeightEighthsChange}
      />

      <p className="text-xs text-gray-400 pt-1">
        {language === 'es'
          ? 'Medidas en pulgadas. Cada persiana se corta a tu medida exacta.'
          : 'Dimensions in inches. Every blind is custom-cut to your exact size.'}
      </p>
    </div>
  );
}
