import React from 'react';

export default function Toaster({ message, type='info', onClose }){
  if(!message) return null;
  const bg = type === 'error' ? '#fee2e2' : '#ecfccb';
  const color = type === 'error' ? '#991b1b' : '#365314';
  return (
    <div style={{position:'fixed',right:20,bottom:20,background:bg,color:color,padding:12,borderRadius:8,boxShadow:'0 8px 24px rgba(2,6,23,0.12)'}}>
      <div style={{minWidth:220}}>{message}</div>
      <div style={{textAlign:'right',marginTop:8}}>
        <button onClick={onClose} className="btn">Close</button>
      </div>
    </div>
  );
}
