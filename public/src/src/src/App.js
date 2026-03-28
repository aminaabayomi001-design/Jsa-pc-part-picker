import { useState } from "react";

// ==== CONSTANTS ====
const USD_TO_NAIRA = 1620;
const DELIVERY_FEE = 35000;
const MARKUP_PER_PART = 10;

// ==== PARTS DATA (CPU/GPU/MB/RAM/Storage/Cooler/PSU/Case) ====
const partsData = {
  cpu: [
    { id: 1, name: "Ryzen 3 3200G", price: 50, socket: "AM4", tdp: 65, link: "#" },
    { id: 2, name: "Ryzen 5 5600", price: 85, socket: "AM4", tdp: 65, link: "#" },
    { id: 3, name: "Intel i3-10100", price: 60, socket: "LGA1200", tdp: 65, link: "#" },
    { id: 4, name: "Intel i7-13700K", price: 320, socket: "LGA1700", tdp: 125, link: "#" },
    { id: 5, name: "Xeon E5 2678 V3", price: 18, socket: "LGA2011-3", tdp: 120, link: "#" },
  ],
  gpu: [
    { id: 1, name: "GT 1030 2GB", price: 45, tdp: 30, length: 150, link: "#" },
    { id: 2, name: "GTX 1050 Ti 4GB", price: 85, tdp: 75, length: 170, link: "#" },
    { id: 3, name: "RTX 3060 12GB", price: 280, tdp: 170, length: 240, link: "#" },
    { id: 4, name: "RTX 4070 Ti 12GB", price: 580, tdp: 220, length: 295, link: "#" },
  ],
  motherboard: [
    { id: 1, name: "B450M mATX", price: 50, socket: "AM4", formFactor: "mATX", link: "#" },
    { id: 2, name: "X570 ATX", price: 180, socket: "AM4", formFactor: "ATX", link: "#" },
    { id: 3, name: "Z690 ATX", price: 250, socket: "LGA1700", formFactor: "ATX", link: "#" },
  ],
  ram: [
    { id: 1, name: "8GB DDR3 1600MHz", price: 14, type: "DDR3", capacity: 8, link: "#" },
    { id: 2, name: "16GB DDR4 3200MHz", price: 32, type: "DDR4", capacity: 16, link: "#" },
    { id: 3, name: "32GB DDR5 6000MHz", price: 95, type: "DDR5", capacity: 32, link: "#" },
  ],
  storage: [
    { id: 1, name: "500GB SATA SSD", price: 28, type: "SATA SSD", link: "#" },
    { id: 2, name: "1TB NVMe SSD", price: 58, type: "NVMe", link: "#" },
    { id: 3, name: "1TB HDD", price: 18, type: "HDD", link: "#" },
  ],
  cooler: [
    { id: 1, name: "Stock Cooler", price: 0, type: "Air", link: "#" },
    { id: 2, name: "DeepCool AK400", price: 28, type: "Air", link: "#" },
    { id: 3, name: "360mm AIO Liquid", price: 65, type: "AIO", link: "#" },
  ],
  psu: [
    { id: 1, name: "450W 80+ Bronze", price: 35, wattage: 450, link: "#" },
    { id: 2, name: "850W 80+ Gold", price: 95, wattage: 850, link: "#" },
    { id: 3, name: "1000W 80+ Platinum", price: 140, wattage: 1000, link: "#" },
  ],
  case: [
    { id: 1, name: "Budget Mini Tower", price: 28, maxGpuLength: 200, supportedFormFactors: ["ITX"], link: "#" },
    { id: 2, name: "Mid Tower ATX", price: 45, maxGpuLength: 320, supportedFormFactors: ["ATX", "mATX"], link: "#" },
    { id: 3, name: "Custom Gojo PC Box", price: 30000, maxGpuLength: 400, supportedFormFactors: ["ATX", "mATX"], link: "#" },
  ],
};

// RAM compatibility
const ramCompatibility = { "AM4": "DDR4", "AM5": "DDR5", "LGA1700": "DDR4", "LGA2011-3": "DDR3" };

// Category labels and icons
const categoryLabels = { cpu:"CPU", gpu:"GPU", motherboard:"Motherboard", ram:"RAM", storage:"Storage", cooler:"Cooler", psu:"Power Supply", case:"Case" };
const categoryIcons = { cpu:"🔲", gpu:"🎮", motherboard:"🖥️", ram:"💾", storage:"💿", cooler:"❄️", psu:"⚡", case:"📦" };

// ==== MAIN COMPONENT ====
export default function App() {
  const [selected,setSelected] = useState({ cpu:null,gpu:null,motherboard:null,ram:null,storage:null,cooler:null,psu:null,case:null });
  const [issues,setIssues] = useState([]);
  const [activeTab,setActiveTab] = useState("cpu");

  const handleSelect=(cat,part)=>{
    const n={...selected,[cat]:part}; setSelected(n); checkCompat(n);
  }

  const checkCompat=(s)=>{
    const errs=[]; const {cpu,gpu,motherboard,ram,psu,case:c}=s;
    if(cpu && motherboard && cpu.socket!==motherboard.socket) errs.push(`❌ Socket mismatch: ${cpu.name} ≠ ${motherboard.name}`);
    if(cpu && ram){ const expected=ramCompatibility[cpu.socket]; if(expected && ram.type!==expected) errs.push(`❌ RAM mismatch: ${cpu.socket} needs ${expected}`);}
    if(gpu && c && gpu.length>c.maxGpuLength) errs.push(`❌ GPU too long: ${gpu.name} won't fit in ${c.name}`);
    if(cpu && gpu && psu){ const needed=cpu.tdp+gpu.tdp+100; if(psu.wattage<needed) errs.push(`❌ PSU too weak: Need ~${needed}W, have ${psu.wattage}W`);}
    setIssues(errs);
  }

  const totalUSD=()=>{ let t=0,count=0; Object.values(selected).forEach(p=>{if(p){t+=p.price;count++;}}); return t+count*MARKUP_PER_PART; }
  const totalNaira=totalUSD()*USD_TO_NAIRA+DELIVERY_FEE;
  const partCount=Object.values(selected).filter(Boolean).length;
  const allSelected=partCount===8;

  return (
    <div style={{background:"#0a0a0a",minHeight:"100vh",color:"#fff",fontFamily:"sans-serif",padding:16}}>
      <div style={{maxWidth:900,margin:"0 auto"}}>
        <h1 style={{color:"#FFD700",fontSize:22}}>🖥️ AliExpress PC Builder</h1>
        <p style={{color:"#888",fontSize:13}}>Select your parts, budgets, custom colors, monitor, FPS, and more</p>

        {/* Tabs */}
        <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:16}}>
          {Object.keys(partsData).map(cat=>(
            <button key={cat} onClick={()=>setActiveTab(cat)}
              style={{padding:"8px 12px",borderRadius:8,border:"none",cursor:"pointer",fontSize:12,
                      background:activeTab===cat?"#FFD700":selected[cat]?"#1a3a1a":"#1a1a1a",
                      color:activeTab===cat?"#000":selected[cat]?"#90EE90":"#fff",fontWeight:activeTab===cat?"bold":"normal"}}>
              {categoryIcons[cat]} {categoryLabels[cat]} {selected[cat]?"✓":""}
            </button>
          ))}
        </div>

        {/* Parts List */}
        <div style={{display:"flex",gap:16,flexWrap:"wrap"}}>
          <div style={{flex:2,minWidth:280}}>
            <h3 style={{color:"#FFD700"}}>{categoryIcons[activeTab]} Select {categoryLabels[activeTab]}</h3>
            {partsData[activeTab].map(p=>(
              <div key={p.id} onClick={()=>handleSelect(activeTab,p)}
                style={{padding:"10px 14px",marginBottom:8,borderRadius:8,cursor:"pointer",
                        background:selected[activeTab]?.id===p.id?"#1a3a1a":"#141414",
                        border:selected[activeTab]?.id===p.id?"1px solid #90EE90":"1px solid #222",
                        display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <div>
                  <div style={{fontWeight:"bold"}}>{p.name}</div>
                  <div style={{fontSize:11,color:"#888"}}>{p.socket && `Socket: ${p.socket} • `}{p.tdp && `TDP: ${p.tdp}W • `}{p.type && `${p.type} • `}{p.wattage && `${p.wattage}W • `}{p.capacity && `${p.capacity}GB • `}{p.formFactor && `${p.formFactor} • `}{p.length && `${p.length}mm`}</div>
                </div>
                <div style={{textAlign:"right"}}>
                  <div style={{color:"#FFD700",fontWeight:"bold"}}>${p.price}</div>
                  <div style={{fontSize:11,color:"#888"}}>₦{((p.price+MARKUP_PER_PART)*USD_TO_NAIRA).toLocaleString()}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Summary */}
          <div style={{flex:1,minWidth:240}}>
            <div style={{background:"#141414",borderRadius:12,padding:16,marginBottom:12}}>
              <h3 style={{color:"#FFD700"}}>📋 Your Build</h3>
              {Object.keys(selected).map(cat=>(
                <div key={cat} style={{marginBottom:8,borderBottom:"1px solid #222"}}>
                  <div style={{fontSize:11,color:"#888"}}>{categoryLabels[cat]}</div>
                  {selected[cat]?<div style={{fontSize:13,color:"#fff",display:"flex",justifyContent:"space-between"}}><span>{selected[cat].name}</span><span style={{color:"#FFD700"}}>${selected[cat].price}</span></div>:<div style={{fontSize:12,color:"#555"}}>Not selected</div>}
                </div>
              ))}
            </div>

            <div style={{background:"#141414",borderRadius:12,padding:16}}>
              <h3 style={{color:"#FFD700"}}>💰 Total Cost</h3>
              <div style={{fontSize:13,color:"#888"}}>Parts: ${Object.values(selected).reduce((a,p)=>a+(p?.price||0),0)}</div>
              <div style={{fontSize:13,color:"#888"}}>Markup (${MARKUP_PER_PART} × {partCount}): ${partCount*MARKUP_PER_PART}</div>
              <div style={{fontSize:20,color:"#FFD700",fontWeight:"bold"}}>₦{totalNaira.toLocaleString()}</div>
              <div style={{fontSize:13,color:"#888"}}>${totalUSD()} USD total</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
     }
