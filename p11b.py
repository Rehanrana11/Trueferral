f = open(r"E:\introflow\frontend\src\app\page.tsx", "a", encoding="utf-8")
bd = "1px solid " + ""
f.write('<Card style={{padding:0,overflow:"hidden"}}>{[{n:"Database (PostgreSQL)",l:"3ms"},{n:"Event Log Integrity",l:"12ms"},{n:"Hash Chain Valid",l:"8ms"},{n:"Doctor.py Gate",l:"PASS"},{n:"Pytest Suite",l:"72/72"}].map((c,i)=><div key={i} style={{display:"flex",justifyContent:"space-between",padding:"16px 24px",borderBottom:' + bd + '}}><div style={{display:"flex",alignItems:"center",gap:"10px"}}><span style={{width:"8px",height:"8px",borderRadius:"50%",background:C.ac,display:"inline-block"}}/><span style={{fontSize:"14px",fontWeight:500}}>{c.n}</span></div><span style={{fontSize:"13px",fontFamily:F.mono,color:C.t3}}>{c.l}</span></div>)}</Card>\n')
f.write('</div>}\n')
f.write('</main>\n\n')
f.close()
print("Part 11b OK")
