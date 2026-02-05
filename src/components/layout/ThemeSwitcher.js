'use client';

export default function ThemeSwitcher() {
  return (
    <select 
      className="select select-bordered select-sm md:select-md min-h-[44px]" 
      data-choose-theme 
      onChange={(e) => {
        const theme = e.target.value;
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
      }}
    >
      <option value="dark">Dark</option>
      <option value="light">Light</option>
      <option value="cupcake">Cupcake</option>
      <option value="forest">Forest</option>
    </select>
  );
} 