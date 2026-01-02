import React from 'react';

export default function ConfirmModal({ open, message, onCancel, onConfirm }){
  if(!open) return null;
  return (
    <div style={{position:'fixed',inset:0,display:'flex',alignItems:'center',justifyContent:'center',background:'rgba(0,0,0,0.45)',zIndex:1400}}>
      <div style={{background:'#fff',padding:20,borderRadius:8,minWidth:320}}>
        <div style={{marginBottom:12}}>{message}</div>
        <div style={{display:'flex',justifyContent:'flex-end',gap:8}}>
          <button className="btn" onClick={onCancel}>Cancel</button>
          <button className="btn" style={{background:'#10b981',color:'#fff'}} onClick={onConfirm}>Confirm</button>
        </div>
      </div>
    </div>
  );
}
