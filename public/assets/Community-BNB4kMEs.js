import{u as E,r as d,a as P,j as e,X as W,v as L,G as F,J as _,K as H,L as R,T as Y,x as G,f as u,z as n}from"./index-CV7tVqks.js";import{M as $}from"./message-square-DP-JJc9E.js";import{Z as q}from"./zap-oBJiekvd.js";function K(){const{user:i}=E(),[x,D]=d.useState([]),[N,I]=d.useState(!0),[s,g]=d.useState("text"),[h,f]=d.useState(""),[a,l]=d.useState({teamA:"",teamB:"",scoreA:0,scoreB:0,period:"FT",matchTime:""}),[b,y]=d.useState(!1),c=d.useRef(null),B=P(),v=t=>{if(c.current){const o=c.current,r=t==="up"?-400:400;o.scrollTo({top:o.scrollTop+r,behavior:"smooth"})}},p=async()=>{try{const t=await u.get("/posts");D(t.data)}catch{n.error("Erro ao carregar o mural.")}finally{I(!1)}};d.useEffect(()=>{p();const t=setInterval(p,15e3);return()=>clearInterval(t)},[]),d.useEffect(()=>{c.current&&(c.current.scrollTop=c.current.scrollHeight)},[x]);const m=async(t=null)=>{const o=t||h;if(!i)return n.error("Faz login para participar no mural! ⚽");if(s==="text"&&!o)return n.error("Escreve alguma coisa!");if(s==="score"&&(!a.teamA||!a.teamB))return n.error("Preenche as equipas!");y(!0);try{await u.post("/posts",{type:s,content:o||(s==="goal"?"GOOOOOOOOOLO! ⚽🔥":""),scoreData:s==="score"?a:null}),f(""),l({teamA:"",teamB:"",scoreA:0,scoreB:0,period:"FT",matchTime:""}),g("text"),p(),n.success("Publicado no mural! 🚀")}catch{n.error("Erro ao publicar.")}finally{y(!1)}},O=async t=>{if(!i){n("Faz login para poderes reagir! ❤️",{icon:"🤝"});return}try{await u.post(`/posts/${t}/like`),p()}catch{n.error("Erro ao reagir.")}},M=async t=>{n(o=>e.jsxs("div",{style:{display:"flex",flexDirection:"column",gap:10,padding:"4px 2px"},children:[e.jsx("p",{style:{margin:0,fontSize:13,fontWeight:600},children:"Queres eliminar esta mensagem?"}),e.jsxs("div",{style:{display:"flex",gap:8},children:[e.jsx("button",{onClick:async()=>{n.dismiss(o.id);try{await u.delete(`/posts/${t}`),n.success("Mensagem eliminada.",{id:"del-success"}),p()}catch{n.error("Erro ao eliminar.")}},style:{background:"var(--red)",color:"#fff",border:"none",padding:"4px 12px",borderRadius:6,fontSize:11,fontWeight:800,cursor:"pointer"},children:"Eliminar"}),e.jsx("button",{onClick:()=>n.dismiss(o.id),style:{background:"rgba(255,255,255,0.1)",color:"#fff",border:"none",padding:"4px 12px",borderRadius:6,fontSize:11,fontWeight:700,cursor:"pointer"},children:"Cancelar"})]})]}),{duration:5e3,position:"bottom-center",style:{background:"#0d1529",color:"#fff",border:"1px solid rgba(255,255,255,0.1)",borderRadius:"16px",padding:"12px"}})};return e.jsxs("div",{className:"page animate-fade-in",style:{background:"var(--bg-primary)",height:"calc(100dvh - 64px)",display:"flex",flexDirection:"column",padding:0,margin:0,position:"relative"},children:[e.jsxs("div",{className:"container",style:{maxWidth:900,flex:1,display:"flex",flexDirection:"column",padding:"0 16px",position:"relative",overflow:"hidden"},children:[e.jsxs("header",{className:"community-header",style:{flexDirection:"row",justifyContent:"space-between",alignItems:"flex-start",gap:4,paddingTop:12},children:[e.jsxs("div",{style:{display:"flex",flexDirection:"column",gap:4},children:[e.jsxs("div",{children:[e.jsxs("h1",{className:"font-syne",style:{marginBottom:2},children:["Mural da ",e.jsx("span",{className:"gradient-text",children:"Malta"})]}),e.jsx("p",{className:"subtitle",style:{textAlign:"left",opacity:.8},children:"Comunidade de futebol em tempo real."})]}),e.jsxs("div",{className:"live-badge",style:{marginTop:4},children:[e.jsx("span",{className:"dot"}),e.jsx("span",{className:"text",children:"Live"})]})]}),e.jsx("button",{onClick:()=>B("/dashboard"),style:{background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:"50%",width:32,height:32,display:"flex",alignItems:"center",justifyContent:"center",color:"var(--text-muted)",cursor:"pointer",transition:"all 0.2s"},onMouseEnter:t=>{t.currentTarget.style.background="rgba(255,255,255,0.1)",t.currentTarget.style.color="#fff"},onMouseLeave:t=>{t.currentTarget.style.background="rgba(255,255,255,0.05)",t.currentTarget.style.color="var(--text-muted)"},children:e.jsx(W,{size:18})})]}),e.jsx("div",{ref:c,style:{flex:1,overflowY:"auto",padding:"20px 0 240px 0",display:"flex",flexDirection:"column",gap:4,scrollBehavior:"smooth",overscrollBehavior:"contain"},children:N?e.jsx("div",{className:"loading-center",children:e.jsx("div",{className:"spinner"})}):x.length===0?e.jsxs("div",{className:"empty-state",children:[e.jsx("h3",{children:"A conversa ainda não começou..."}),e.jsx("p",{children:'Diz o primeiro "Olá"!'})]}):x.map((t,o)=>{var k,z,w,S,C,A,T;const r=i&&((k=t.user)==null?void 0:k._id)===i._id,j=!r&&(o===0||((z=x[o-1].user)==null?void 0:z._id)!==((w=t.user)==null?void 0:w._id));return e.jsxs("div",{className:"animate-slide-up",style:{display:"flex",flexDirection:"column",alignItems:r?"flex-end":"flex-start",width:"100%",marginTop:j?6:1},children:[j&&e.jsx("div",{style:{fontSize:9,fontWeight:700,color:"var(--green)",marginBottom:1,marginLeft:4},children:((S=t.user)==null?void 0:S.name)||"Utilizador"}),e.jsx("div",{style:{display:"flex",flexDirection:r?"row-reverse":"row",gap:6,maxWidth:"92%"},children:e.jsxs("div",{style:{background:r?"var(--green)":"rgba(255,255,255,0.08)",color:r?"#000":"#fff",padding:"4px 10px",borderRadius:r?"10px 10px 2px 10px":"10px 10px 10px 2px",boxShadow:"0 2px 6px rgba(0,0,0,0.1)",border:"1px solid "+(r?"transparent":"rgba(255,255,255,0.05)"),wordBreak:"break-word",overflowWrap:"break-word"},children:[t.type==="text"&&e.jsx("p",{style:{fontSize:12,lineHeight:1.3,margin:0},children:t.content}),t.type==="score"&&e.jsxs("div",{style:{background:r?"rgba(0,0,0,0.05)":"rgba(0,0,0,0.2)",padding:"5px 10px",borderRadius:8,display:"flex",flexDirection:"column",alignItems:"center",gap:2,marginTop:1,minWidth:210},children:[e.jsxs("div",{style:{display:"flex",alignItems:"center",justifyContent:"space-between",width:"100%",gap:8},children:[e.jsx("span",{style:{fontWeight:800,fontSize:11,flex:1,textAlign:"right"},children:t.scoreData.teamA}),e.jsxs("div",{style:{background:r?"#000":"var(--green)",color:r?"var(--green)":"#000",padding:"1px 10px",borderRadius:4,fontWeight:900,fontSize:13,letterSpacing:.2,boxShadow:"0 2px 4px rgba(0,0,0,0.1)"},children:[t.scoreData.scoreA,"-",t.scoreData.scoreB]}),e.jsx("span",{style:{fontWeight:800,fontSize:11,flex:1,textAlign:"left"},children:t.scoreData.teamB})]}),t.scoreData.period&&e.jsx("div",{style:{background:r?"rgba(0,0,0,0.08)":"rgba(255,255,255,0.03)",padding:"1px 8px",borderRadius:10,display:"flex",alignItems:"center",gap:2},children:e.jsx("span",{style:{fontSize:8,fontWeight:800,textTransform:"uppercase",color:r?"#000":"var(--green)"},children:t.scoreData.period==="PR"?"Pré":t.scoreData.period==="1T"?"1ª P":t.scoreData.period==="2T"?"2ª P":"Fim"})})]}),t.type==="goal"&&e.jsx("div",{style:{textAlign:"center",padding:"2px 10px",background:t.content.includes("MADRID")?"#fff":t.content.includes("BARÇA")?"linear-gradient(90deg, #a50044, #004d98)":"#00C853",borderRadius:5,marginTop:1,minWidth:120},children:e.jsx("h4",{style:{margin:0,fontSize:11,color:t.content.includes("MADRID")?"#000":"#fff"},className:"pulse-text",children:t.content})}),e.jsxs("div",{style:{marginTop:4,display:"flex",alignItems:"center",justifyContent:"flex-end",gap:6,opacity:.5},children:[e.jsxs("button",{onClick:()=>O(t._id),style:{background:"none",border:"none",color:(C=t.likes)!=null&&C.includes(i==null?void 0:i._id)?r?"#000":"var(--red)":"inherit",display:"flex",alignItems:"center",gap:3,fontSize:11,fontWeight:700,cursor:"pointer"},children:[e.jsx(L,{size:14,fill:(A=t.likes)!=null&&A.includes(i==null?void 0:i._id)?r?"#000":"var(--red)":"none"})," ",((T=t.likes)==null?void 0:T.length)||0]}),(r||(i==null?void 0:i.role)==="superadmin")&&e.jsx("button",{onClick:()=>M(t._id),style:{background:"none",border:"none",color:r?"#000":"var(--red)",cursor:"pointer",display:"flex",alignItems:"center",opacity:.6},children:e.jsx(F,{size:13})}),e.jsx("span",{style:{fontSize:10,color:"var(--text-muted)"},children:new Date(t.createdAt).toLocaleTimeString("pt-MZ",{hour:"2-digit",minute:"2-digit",hour12:!1})})]})]})})]},t._id)})}),e.jsxs("div",{style:{position:"fixed",right:16,bottom:160,display:"flex",flexDirection:"column",gap:8,zIndex:999},children:[e.jsx("button",{onClick:()=>v("up"),style:{width:36,height:36,borderRadius:"50%",background:"rgba(8, 13, 26, 0.8)",border:"1px solid rgba(255,255,255,0.1)",color:"#fff",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",backdropFilter:"blur(8px)",boxShadow:"0 4px 12px rgba(0,0,0,0.3)"},children:e.jsx(_,{size:20})}),e.jsx("button",{onClick:()=>v("down"),style:{width:36,height:36,borderRadius:"50%",background:"rgba(8, 13, 26, 0.8)",border:"1px solid rgba(255,255,255,0.1)",color:"#fff",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",backdropFilter:"blur(8px)",boxShadow:"0 4px 12px rgba(0,0,0,0.3)"},children:e.jsx(H,{size:20})})]}),e.jsx("div",{style:{position:"fixed",bottom:0,left:0,right:0,padding:"8px 16px max(24px, env(safe-area-inset-bottom))",borderTop:"1px solid rgba(255,255,255,0.08)",background:"rgba(8, 13, 26, 0.97)",zIndex:100,backdropFilter:"blur(16px)",maxHeight:"40vh",overflowY:"auto"},children:i?e.jsxs("div",{className:"community-input-area",style:{display:"flex",flexDirection:"column",gap:6},children:[e.jsxs("div",{style:{display:"flex",gap:4},children:[e.jsxs("button",{onClick:()=>g("text"),className:`tab ${s==="text"?"active":""}`,style:{flex:1,height:28,fontSize:10,borderRadius:6,padding:0},children:[e.jsx($,{size:11})," Texto"]}),e.jsxs("button",{onClick:()=>g("score"),className:`tab ${s==="score"?"active":""}`,style:{flex:1,height:28,fontSize:10,borderRadius:6,padding:0},children:[e.jsx(Y,{size:11})," Placar"]}),e.jsxs("button",{onClick:()=>g("goal"),className:`tab ${s==="goal"?"active":""}`,style:{flex:1,height:28,fontSize:10,borderRadius:6,padding:0},children:[e.jsx(q,{size:11})," GOLO"]})]}),e.jsxs("div",{style:{display:"flex",gap:6,alignItems:"center"},children:[e.jsxs("div",{style:{flex:1},children:[s==="text"&&e.jsx("textarea",{className:"form-input",placeholder:"Escreve uma mensagem...",style:{minHeight:36,maxHeight:100,borderRadius:10,padding:"8px 12px",fontSize:13},value:h,onChange:t=>f(t.target.value)}),s==="score"&&e.jsxs("div",{style:{display:"flex",flexDirection:"column",gap:6},children:[e.jsx("div",{style:{display:"flex",gap:4,flexWrap:"wrap",marginBottom:2},children:["⚽","🏆","🔥","⚔️","🏁","🛡️"].map(t=>e.jsx("button",{onClick:()=>{a.teamA?a.teamB||l({...a,teamB:t+" "}):l({...a,teamA:t+" "})},style:{background:"rgba(255,255,255,0.05)",border:"none",borderRadius:4,width:24,height:24,display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,cursor:"pointer"},children:t},t))}),e.jsxs("div",{style:{display:"flex",alignItems:"center",gap:4,background:"rgba(255,255,255,0.03)",padding:4,borderRadius:10,border:"1px solid var(--border)"},children:[e.jsx("input",{className:"form-input",placeholder:"Equipa A",style:{height:28,fontSize:11,padding:"0 6px"},value:a.teamA,onChange:t=>l({...a,teamA:t.target.value})}),e.jsx("input",{type:"number",className:"form-input",style:{width:35,height:28,textAlign:"center",fontSize:11,padding:0},value:a.scoreA,onChange:t=>l({...a,scoreA:parseInt(t.target.value)})}),e.jsx("span",{style:{color:"var(--text-muted)",fontSize:10},children:"vs"}),e.jsx("input",{type:"number",className:"form-input",style:{width:35,height:28,textAlign:"center",fontSize:11,padding:0},value:a.scoreB,onChange:t=>l({...a,scoreB:parseInt(t.target.value)})}),e.jsx("input",{className:"form-input",placeholder:"Equipa B",style:{height:28,fontSize:11,padding:"0 6px"},value:a.teamB,onChange:t=>l({...a,teamB:t.target.value})}),e.jsx("input",{type:"text",className:"form-input",placeholder:"15:30",style:{width:50,height:28,fontSize:10,padding:"0 4px",textAlign:"center"},value:a.matchTime,onChange:t=>l({...a,matchTime:t.target.value})})]}),e.jsx("div",{style:{display:"flex",gap:4},children:["PR","1T","2T","FT"].map(t=>e.jsx("button",{onClick:()=>l({...a,period:t}),style:{flex:1,height:20,fontSize:8,borderRadius:4,background:a.period===t?"var(--green)":"rgba(255,255,255,0.05)",color:a.period===t?"#000":"var(--text-muted)",border:"none",fontWeight:700,cursor:"pointer"},children:t==="PR"?"Pré":t==="1T"?"1ª P":t==="2T"?"2ª P":"Final"},t))})]}),s==="goal"&&e.jsxs("div",{style:{display:"flex",gap:4},children:[e.jsx("button",{onClick:()=>m("GOOOOOOOOOLO! ⚽🔥"),className:"btn btn-secondary",style:{flex:1,height:36,fontSize:10,borderRadius:8,width:"auto",padding:"0 8px"},children:"Geral"}),e.jsx("button",{onClick:()=>m("HALA MADRID! ⚪👑"),className:"btn btn-secondary",style:{flex:1,height:36,fontSize:10,borderRadius:8,borderColor:"#fff",width:"auto",padding:"0 8px"},children:"Madrid"}),e.jsx("button",{onClick:()=>m("VISCA BARÇA! 🔴🔵"),className:"btn btn-secondary",style:{flex:1,height:36,fontSize:10,borderRadius:8,borderColor:"#ff4d4d",width:"auto",padding:"0 8px"},children:"Barça"})]})]}),s!=="goal"&&e.jsx("button",{onClick:()=>m(),className:"btn btn-primary",disabled:b,style:{width:44,height:44,borderRadius:"50%",padding:0,justifyContent:"center",flexShrink:0,boxShadow:"0 4px 12px rgba(0, 200, 83, 0.3)",transition:"all 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275)"},onMouseEnter:t=>t.currentTarget.style.transform="scale(1.1)",onMouseLeave:t=>t.currentTarget.style.transform="scale(1)",children:b?e.jsx("span",{className:"spinner",style:{width:16,height:16,border:"2px solid #000",borderTopColor:"transparent"}}):e.jsx(G,{size:20})})]})]}):e.jsxs("div",{style:{textAlign:"center",padding:"8px 0",background:"var(--bg-card)",borderRadius:16,border:"1px solid var(--border)"},children:[e.jsx("p",{style:{color:"var(--text-secondary)",marginBottom:8,fontSize:12},children:"Inicia sessão para comentar!"}),e.jsxs("div",{style:{display:"flex",gap:8,justifyContent:"center"},children:[e.jsx(R,{to:"/login",className:"btn btn-secondary btn-sm",style:{height:28,fontSize:11},children:"Entrar"}),e.jsx(R,{to:"/register",className:"btn btn-primary btn-sm",style:{height:28,fontSize:11},children:"Criar Conta"})]})]})})]}),e.jsx("style",{children:`
        /* Responsive Header */
        .community-header {
          padding: 20px 0 16px;
          border-bottom: 1px solid var(--border);
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .community-header h1 {
          font-size: 28px;
          font-weight: 900;
          letter-spacing: -1px;
          margin: 0;
        }
        .community-header .live-badge {
          display: flex;
          align-items: center;
          gap: 6px;
          margin-top: 4px;
        }
        .community-header .dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: var(--green);
          display: inline-block;
          animation: pulse 2s infinite;
        }
        .community-header .text {
          font-size: 11px;
          color: var(--text-secondary);
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 1px;
        }
        .community-header .subtitle {
          color: var(--text-muted);
          font-size: 13px;
          text-align: right;
          line-height: 1.3;
          margin: 0;
        }

        @media (max-width: 768px) {
          .community-header {
            padding: 12px 0 8px;
          }
          .community-header h1 { font-size: 20px; letter-spacing: -0.5px; }
          .community-header .dot { width: 6px; height: 6px; }
          .community-header .text { font-size: 9px; }
          .community-header .subtitle { font-size: 10px; max-width: 140px; }
        }

        /* Override global mobile .btn rules inside input area */
        .community-input-area .btn {
          width: auto !important;
          height: auto !important;
          min-width: 0 !important;
        }
        .community-input-area .btn-primary {
          width: 40px !important;
          height: 40px !important;
        }

        .spin-slow { animation: spin 8s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        
        .pulse-text { animation: pulse-text 2s ease-in-out infinite; }
        @keyframes pulse-text {
          0%, 100% { transform: scale(1); text-shadow: 0 0 10px rgba(255,255,255,0); }
          50% { transform: scale(1.05); text-shadow: 0 0 20px rgba(255,255,255,0.4); }
        }

        .bounce-animation { animation: bounce 2s infinite; }
        @keyframes bounce {
          0%, 20%, 50%, 80%, 100% {transform: translateY(0);}
          40% {transform: translateY(-10px);}
          60% {transform: translateY(-5px);}
        }

        .celebration-particles {
          position: absolute; inset: 0; pointer-events: none;
          display: flex; justify-content: space-around; align-items: flex-end;
        }
        .celebration-particles span {
          font-size: 24px;
          animation: float-up var(--d, 3s) linear infinite;
          opacity: 0;
          transform: translateY(100%);
        }
        .celebration-particles span:nth-child(1) { --d: 3s; animation-delay: 0s; left: 10%; }
        .celebration-particles span:nth-child(2) { --d: 4s; animation-delay: 1s; left: 30%; }
        .celebration-particles span:nth-child(3) { --d: 2.5s; animation-delay: 0.5s; left: 50%; }
        .celebration-particles span:nth-child(4) { --d: 3.5s; animation-delay: 1.5s; left: 70%; }
        .celebration-particles span:nth-child(5) { --d: 4.5s; animation-delay: 2s; left: 90%; }

        @keyframes float-up {
          0% { transform: translateY(100%) rotate(0deg); opacity: 0; }
          20% { opacity: 1; }
          80% { opacity: 1; }
          100% { transform: translateY(-200%) rotate(360deg); opacity: 0; }
        }
      `})]})}export{K as default};
