import clsx from 'clsx';
import { FC, ReactElement, useEffect, useId, useRef, useState } from 'react';

export interface DropdownOption {
  id: string | number;
  label: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  value: any;
}

interface ICustomDropdownProps {
  options: DropdownOption[];
  placeholder: string;
  dropdownMessage: string;
  defaultOption: DropdownOption | null;
  onSelect?: (option: DropdownOption) => void;
}

const CustomDropdown: FC<ICustomDropdownProps> = ({
  options = [],
  placeholder = 'Select an option',
  dropdownMessage = 'No options available',
  onSelect,
  defaultOption = null
}): ReactElement => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [selectedOption, setSelectedOption] = useState<DropdownOption | null>(defaultOption);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const id = useId();

  const toggleDropdown = (): void => {
    setIsOpen(!isOpen);
  };

  const handleSelect = (option: DropdownOption): void => {
    setSelectedOption(option);
    setIsOpen(false);
    if (onSelect) {
      onSelect(option);
    }
  };

  useEffect(() => {
    if (defaultOption) {
      setSelectedOption(defaultOption);
    }

    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [defaultOption]);

  return (
    <div className="inherit w-full relative" ref={dropdownRef}>
      <button
        onClick={toggleDropdown}
        className="w-full px-4 py-2 cursor-pointer bg-white border border-gray-300 rounded-md text-left flex justify-between items-center hover:bg-gray-50 focus:outline-none"
        aria-expanded={isOpen}
      >
        <span className="text-gray-700 truncate overflow-hidden whitespace-nowrap w-[90%]">
          {selectedOption?.label || placeholder}
        </span>
        <span
          className={clsx('text-sm text-gray-500 transition-transform duration-200', {
            'transform rotate-180': isOpen
          })}
        >
          ▼
        </span>
      </button>

      {isOpen && (
        <ul
          className="absolute w-full mt-1 py-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-48 overflow-y-auto z-50"
          id={`dropdown-${id}`}
          role="listbox"
          aria-label={placeholder}
        >
          {options.length > 0 ? (
            options.map((option: DropdownOption) => (
              <li
                key={option.id}
                role="option"
                aria-selected={option.id === selectedOption?.id}
                onClick={() => handleSelect(option)}
                className={clsx('px-4 py-2 text-gray-700 hover:bg-gray-100 cursor-pointer', {
                  'bg-gray-100': option.id === selectedOption?.id
                })}
              >
                {option.label}
              </li>
            ))
          ) : (
            <li role="option" className="px-4 py-2 text-gray-700 hover:bg-gray-100 cursor-pointer">
              {dropdownMessage}
            </li>
          )}
        </ul>
      )}
    </div>
  );
};

export default CustomDropdown;
