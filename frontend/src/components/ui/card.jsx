// card.jsx
export function Card({ children }) {
    return <div className="rounded-xl shadow-md p-4 bg-white">{children}</div>;
  }
  
  export function CardContent({ children }) {
    return <div className="mt-2">{children}</div>;
  }
  