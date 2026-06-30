export const globalStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Cairo:wght@400;600;700;900&display=swap');
  *{box-sizing:border-box;margin:0;padding:0;}
  :root{--bg:#080c14;--bg2:#0d1420;--accent:#f0c040;--accent2:#e07b20;--green:#22c97a;--red:#e03c3c;--glass:rgba(255,255,255,0.05);--border:rgba(255,255,255,0.08);--text:#f0f4ff;--muted:rgba(240,244,255,0.45);} 
  body{background:var(--bg);color:var(--text);font-family:'Cairo',sans-serif;direction:rtl;}
  @keyframes fadeUp{from{opacity:0;transform:translateY(18px);}to{opacity:1;transform:translateY(0);}}
  @keyframes pulse{0%,100%{transform:scale(1);}50%{transform:scale(1.06);}}
  @keyframes shine{0%{background-position:-200% center;}100%{background-position:200% center;}}
  @keyframes timerPop{0%,100%{transform:scale(1);}50%{transform:scale(1.15);}}
  @keyframes revealSlide{from{opacity:0;transform:translateY(12px) scale(0.96);}to{opacity:1;transform:translateY(0) scale(1);}}
  input,button{font-family:'Cairo',sans-serif;}
  button{cursor:pointer;}
  button:disabled{cursor:not-allowed;}
  .board-layout{grid-template-columns:200px 1fr 200px;}
  .categories-grid{grid-template-columns:repeat(3,minmax(0,1fr));}
  .diff-cell{width:32px;height:32px;font-size:10px;}
  .question-image{max-width:640px;aspect-ratio:16/9;}
  .action-button{width:min(520px,100%);}
  @media (max-width: 1024px){
    .board-layout{grid-template-columns:180px 1fr 180px;}
  }
  @media (max-width: 900px){
    .board-layout{grid-template-columns:1fr;gap:10px;padding:0 10px;}
    .team-panel{max-width:100%;margin:0 auto;}
    .categories-grid{grid-template-columns:repeat(2,minmax(0,1fr));gap:10px;}
  }
  @media (max-width: 640px){
    .board-layout{grid-template-columns:1fr;gap:8px;padding:0 8px;}
    .team-panel{padding:10px 8px;}
    .categories-grid{grid-template-columns:1fr;gap:12px;}
    .category-card{grid-template-columns:24px 1fr 24px;gap:6px;padding:4px;max-width:340px;margin:0 auto;}
    .category-title{padding:6px 4px;}
    .diff-cell{width:22px;height:22px;font-size:8px;border-radius:5px;}
    .question-image{max-width:100%;aspect-ratio:4/3;}
    .action-button{width:100%;}
  }
`;
