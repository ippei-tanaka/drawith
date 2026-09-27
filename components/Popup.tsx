import "@/styles/components.css";

export function Popup(
  { children, isOpen, onClickBackground }: 
  { children: React.ReactNode, isOpen: boolean, onClickBackground?: () => void }) 
{
  return isOpen && (
    <div className="popup-background" onClick={onClickBackground}>
      <div className="popup" onClick={(e) => e.stopPropagation()}>
        {children}
      </div>
    </div>
  );
}