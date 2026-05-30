import './button.css';

export default function CustomButton({ children = 'Кнопка', onClick, active }) {
  return (
    <button
      type="primary"
      className={`custom-button ${active ? 'active' : ''}`}
      onClick={onClick}
    >
      {children}
    </button>
  );
}
