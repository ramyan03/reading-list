/**
 * A sideways row of posters with no scrollbar. The mouse wheel scrolls it
 * while the pointer is over it (lib/wheel.js, installed for the whole app);
 * touch and trackpads swipe it natively.
 */
export default function Rail({ className = '', children, ...rest }) {
  return (
    <div className={`rd-rail ${className}`} {...rest}>
      {children}
    </div>
  );
}
