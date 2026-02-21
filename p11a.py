f = open(r"E:\introflow\frontend\src\app\page.tsx", "a", encoding="utf-8")
f.write('{view==="health"&&<div><h1 style={{margin:"0 0 24px",fontSize:"24px",fontWeight:800}}>System Health</h1>\n')
bdr = "4px solid " + ""
f.write('<Card style={{marginBottom:"24px",borderLeft:' + bdr + '}}>\n')
sh = "0 0 16px " + ""
f.write('<div style={{display:"flex",alignItems:"center",gap:"12px"}}><div style={{width:"40px",height:"40px",borderRadius:"50%",background:C.acd,display:"flex",alignItems:"center",justifyContent:"center",fontSize:"20px",boxShadow:' + sh + '}}>+</div>\n')
f.write('<div><div style={{fontSize:"18px",fontWeight:700,color:C.ac}}>All Systems Operational</div><div style={{fontSize:"13px",color:C.t2,fontFamily:F.mono}}>v1.0.0 RC_1.0_0</div></div></div></Card>\n')
f.close()
print("Part 11a OK")
