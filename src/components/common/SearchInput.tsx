import { Search } from 'lucide-react';

interface SearchInputProps {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
}

const SearchInput = ({ value, onChange, placeholder = 'Rechercher...' }: SearchInputProps) => (
  <div className="relative">
    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="medibook-input w-full pl-10"
    />
  </div>
);

export default SearchInput;
