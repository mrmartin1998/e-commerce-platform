'use client';

export default function ThemeSwitcher() {
  return (
    <select 
      className="select select-bordered select-sm" 
      data-choose-theme 
      onChange={(e) => {
        const theme = e.target.value;
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
      }}
    >
      <option value="light">Light</option>
      <option value="dark">Dark</option>
      <option value="cupcake">Cupcake</option>
      <option value="forest">Forest</option>
    </select>
  );
} 