"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import { useParams, usePathname, useRouter } from "next/navigation";

import { MdLanguage } from "react-icons/md";
import { localeNames } from "@/i18n/locale";

export default function ({ isIcon = false }: { isIcon?: boolean }) {
  const params = useParams();
  const locale = (params?.locale as string) || 'en';
  const router = useRouter();
  const pathname = usePathname() || '';

  const handleSwitchLanguage = (value: string) => {
    if (value !== locale) {
      let newPathName = pathname.replace(`/${locale}`, `/${value}`);
      if (!newPathName.startsWith(`/${value}`)) {
        newPathName = `/${value}${newPathName}`;
      }
      router.push(newPathName);
    }
  };

  return (
    <Select value={locale} onValueChange={handleSwitchLanguage}>
      <SelectTrigger className="flex items-center gap-x-2 border-none text-muted-foreground outline-none hover:bg-transparent focus:ring-0 focus:ring-offset-0">
        <MdLanguage size={20} />
        {!isIcon && (
          <span className="hidden md:block">{localeNames[locale]}</span>
        )}
      </SelectTrigger>
      <SelectContent className="z-50">
        {Object.keys(localeNames).map((key: string) => {
          const name = localeNames[key];
          return (
            <SelectItem className="cursor-pointer" key={key} value={key}>
              {name}
            </SelectItem>
          );
        })}
      </SelectContent>
    </Select>
  );
}
