// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title BaseforAssets
 * @notice Pure CSS and JavaScript assets for Basefor NFTs
 */
contract BaseforAssets {
    /**
     * @notice Returns base64-encoded cloud SVG
     */
    function getCloudSVGBase64() external pure returns (string memory) {
        return
            "PHN2ZyB2aWV3Qm94PSIwIDAgMTAwMCA1MDAiIHByZXNlcnZlQXNwZWN0UmF0aW89InhNaWRZTWlkIHNsaWNlIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPgogICAgICA8ZGVmcz4KICAgICAgICA8bGluZWFyR3JhZGllbnQgaWQ9InNreUdyYWRpZW50IiB4MT0iMCUiIHkxPSIxMDAlIiB4Mj0iMCUiIHkyPSIwJSI+CiAgICAgICAgICA8c3RvcCBvZmZzZXQ9IjAlIiBzdHlsZT0ic3RvcC1jb2xvcjogIzJhMmEyYTsgc3RvcC1vcGFjaXR5OiAxIiAvPgogICAgICAgICAgPHN0b3Agb2Zmc2V0PSI1MCUiIHN0eWxlPSJzdG9wLWNvbG9yOiAjMWExYTFhOyBzdG9wLW9wYWNpdHk6IDEiIC8+CiAgICAgICAgICA8c3RvcCBvZmZzZXQ9IjEwMCUiIHN0eWxlPSJzdG9wLWNvbG9yOiAjMGEwYTBhOyBzdG9wLW9wYWNpdHk6IDEiIC8+CiAgICAgICAgPC9saW5lYXJHcmFkaWVudD4KICAgICAgICA8ZmlsdGVyIGlkPSJmaWx0ZXItYmFzZSIgeD0iLTUwJSIgeT0iLTUwJSIgd2lkdGg9IjIwMCUiIGhlaWdodD0iMjAwJSI+CiAgICAgICAgICA8ZmVUdXJidWxlbmNlIHR5cGU9ImZyYWN0YWxOb2lzZSIgYmFzZUZyZXF1ZW5jeT0iMC4wMDgiIG51bU9jdGF2ZXM9IjYiIHNlZWQ9Ijg1MTciIC8+CiAgICAgICAgICA8ZmVEaXNwbGFjZW1lbnRNYXAgaW49IlNvdXJjZUdyYXBoaWMiIHNjYWxlPSIxODAiIC8+CiAgICAgICAgICA8ZmVHYXVzc2lhbkJsdXIgc3RkRGV2aWF0aW9uPSIyNSIgLz4KICAgICAgICAgIDxmZUNvbXBvbmVudFRyYW5zZmVyPjxmZUZ1bmNBIHR5cGU9ImxpbmVhciIgc2xvcGU9IjAuOSIgLz48L2ZlQ29tcG9uZW50VHJhbnNmZXI+CiAgICAgICAgPC9maWx0ZXI+CiAgICAgICAgPGZpbHRlciBpZD0iZmlsdGVyLWJhY2siIHg9Ii01MCUiIHk9Ii01MCUiIHdpZHRoPSIyMDAlIiBoZWlnaHQ9IjIwMCUiPgogICAgICAgICAgPGZlVHVyYnVsZW5jZSB0eXBlPSJmcmFjdGFsTm9pc2UiIGJhc2VGcmVxdWVuY3k9IjAuMDA3IiBudW1PY3RhdmVzPSI0IiBzZWVkPSI5ODIzIiAvPgogICAgICAgICAgPGZlRGlzcGxhY2VtZW50TWFwIGluPSJTb3VyY2VHcmFwaGljIiBzY2FsZT0iMTYwIiAvPgogICAgICAgICAgPGZlR2F1c3NpYW5CbHVyIHN0ZERldmlhdGlvbj0iMzAiIC8+CiAgICAgICAgICA8ZmVDb21wb25lbnRUcmFuc2Zlcj48ZmVGdW5jQSB0eXBlPSJsaW5lYXIiIHNsb3BlPSIwLjMiIC8+PC9mZUNvbXBvbmVudFRyYW5zZmVyPgogICAgICAgIDwvZmlsdGVyPgogICAgICAgIDxmaWx0ZXIgaWQ9ImZpbHRlci1taWQiIHg9Ii01MCUiIHk9Ii01MCUiIHdpZHRoPSIyMDAlIiBoZWlnaHQ9IjIwMCUiPgogICAgICAgICAgPGZlVHVyYnVsZW5jZSB0eXBlPSJmcmFjdGFsTm9pc2UiIGJhc2VGcmVxdWVuY3k9IjAuMDA5IiBudW1PY3RhdmVzPSI1IiBzZWVkPSI3NDEyIiAvPgogICAgICAgICAgPGZlRGlzcGxhY2VtZW50TWFwIGluPSJTb3VyY2VHcmFwaGljIiBzY2FsZT0iMTcwIiAvPgogICAgICAgICAgPGZlR2F1c3NpYW5CbHVyIHN0ZERldmlhdGlvbj0iMzUiIC8+CiAgICAgICAgICA8ZmVDb21wb25lbnRUcmFuc2Zlcj48ZmVGdW5jQSB0eXBlPSJsaW5lYXIiIHNsb3BlPSIwLjIiIC8+PC9mZUNvbXBvbmVudFRyYW5zZmVyPgogICAgICAgIDwvZmlsdGVyPgogICAgICAgIDxmaWx0ZXIgaWQ9ImZpbHRlci1mcm9udCIgeD0iLTUwJSIgeT0iLTUwJSIgd2lkdGg9IjIwMCUiIGhlaWdodD0iMjAwJSI+CiAgICAgICAgICA8ZmVUdXJidWxlbmNlIHR5cGU9ImZyYWN0YWxOb2lzZSIgYmFzZUZyZXF1ZW5jeT0iMC4wMDYiIG51bU9jdGF2ZXM9IjUiIHNlZWQ9IjYyNTEiIC8+CiAgICAgICAgICA8ZmVEaXNwbGFjZW1lbnRNYXAgaW49IlNvdXJjZUdyYXBoaWMiIHNjYWxlPSIxNDAiIC8+CiAgICAgICAgICA8ZmVHYXVzc2lhbkJsdXIgc3RkRGV2aWF0aW9uPSI0MCIgLz4KICAgICAgICAgIDxmZUNvbXBvbmVudFRyYW5zZmVyPjxmZUZ1bmNBIHR5cGU9ImxpbmVhciIgc2xvcGU9IjAuNCIgLz48L2ZlQ29tcG9uZW50VHJhbnNmZXI+CiAgICAgICAgPC9maWx0ZXI+CiAgICAgIDwvZGVmcz4KICAgICAgPHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNza3lHcmFkaWVudCkiIC8+CiAgICAgIDxnIGZpbHRlcj0idXJsKCNmaWx0ZXItZnJvbnQpIj4KICAgICAgICA8ZWxsaXBzZSBjeD0iNTIwIiBjeT0iMjQwIiByeD0iNDQwIiByeT0iMTYwIiBmaWxsPSJyZ2JhKDAsIDAsIDAsIDAuMTUpIiAvPgogICAgICAgIDxlbGxpcHNlIGN4PSI0MDAiIGN5PSIyNjAiIHJ4PSIzNzAiIHJ5PSIxNTAiIGZpbGw9InJnYmEoMCwgMCwgMCwgMC4xKSIgLz4KICAgICAgICA8ZWxsaXBzZSBjeD0iNjAwIiBjeT0iMjUwIiByeD0iNDAwIiByeT0iMTU1IiBmaWxsPSJyZ2JhKDAsIDAsIDAsIDAuMTIpIiAvPgogICAgICA8L2c+CiAgICAgIDxnIGZpbHRlcj0idXJsKCNmaWx0ZXItbWlkKSI+CiAgICAgICAgPGVsbGlwc2UgY3g9IjUyMCIgY3k9IjIwMCIgcng9IjQ3MCIgcnk9IjE2NSIgZmlsbD0icmdiYSg2NiwgMTA1LCAxNDYsIDAuMSkiIC8+CiAgICAgICAgPGVsbGlwc2UgY3g9IjQ1MCIgY3k9IjIxMCIgcng9IjQyMCIgcnk9IjE1NSIgZmlsbD0icmdiYSg2NiwgMTA1LCAxNDYsIDAuMDgpIiAvPgogICAgICAgIDxlbGxpcHNlIGN4PSI2MjAiIGN5PSIxOTUiIHJ4PSI0NTAiIHJ5PSIxNjAiIGZpbGw9InJnYmEoNjYsIDEwNSwgMTQ2LCAwLjA5KSIgLz4KICAgICAgPC9nPgogICAgICA8ZyBmaWx0ZXI9InVybCgjZmlsdGVyLWJhY2spIj4KICAgICAgICA8ZWxsaXBzZSBjeD0iMzcwIiBjeT0iMTQwIiByeD0iNDQwIiByeT0iMTYwIiBmaWxsPSJyZ2JhKDIxNSwgMjE1LCAyMTUsIDAuMTUpIiAvPgogICAgICAgIDxlbGxpcHNlIGN4PSI1MDAiIGN5PSIxMzAiIHJ4PSI0MDAiIHJ5PSIxNTUiIGZpbGw9InJnYmEoMjE1LCAyMTUsIDIxNSwgMC4xMikiIC8+CiAgICAgICAgPGVsbGlwc2UgY3g9IjYwMCIgY3k9IjE0NSIgcng9IjQyMCIgcnk9IjE1MCIgZmlsbD0icmdiYSgyMTUsIDIxNSwgMjE1LCAwLjE0KSIgLz4KICAgICAgPC9nPgogICAgICA8ZyBmaWx0ZXI9InVybCgjZmlsdGVyLWJhc2UpIj4KICAgICAgICA8ZWxsaXBzZSBjeD0iNTIwIiBjeT0iMTAwIiByeD0iNTAwIiByeT0iMTgwIiBmaWxsPSJyZ2JhKDI1NSwgMjU1LCAyNTUsIDAuNCkiIC8+CiAgICAgICAgPGVsbGlwc2UgY3g9IjQwMCIgY3k9IjExMCIgcng9IjQ2MCIgcnk9IjE2NSIgZmlsbD0icmdiYSgyNTUsIDI1NSwgMjU1LCAwLjM1KSIgLz4KICAgICAgICA8ZWxsaXBzZSBjeD0iNjIwIiBjeT0iOTUiIHJ4PSI0ODAiIHJ5PSIxNzUiIGZpbGw9InJnYmEoMjU1LCAyNTUsIDI1NSwgMC4zOCkiIC8+CiAgICAgICAgPGVsbGlwc2UgY3g9IjUyMCIgY3k9IjcwIiByeD0iNDQwIiByeT0iMTYwIiBmaWxsPSJyZ2JhKDI1NSwgMjU1LCAyNTUsIDAuMzIpIiAvPgogICAgICAgIDxlbGxpcHNlIGN4PSIzMjAiIGN5PSIxMjAiIHJ4PSI0MDAiIHJ5PSIxNTAiIGZpbGw9InJnYmEoMjU1LCAyNTUsIDI1NSwgMC4zKSIgLz4KICAgICAgICA8ZWxsaXBzZSBjeD0iNzIwIiBjeT0iMTE1IiByeD0iNDIwIiByeT0iMTY1IiBmaWxsPSJyZ2JhKDI1NSwgMjU1LCAyNTUsIDAuMzUpIiAvPgogICAgICA8L2c+CiAgICA8L3N2Zz4=";
    }

    /**
     * @notice Returns JavaScript for canvas animation
     */
    function getJavaScript() external pure returns (string memory) {
        return
            string(
                abi.encodePacked(
                    _getJavaScriptInit(),
                    _getJavaScriptAnimate(),
                    _getJavaScriptDots()
                )
            );
    }

    /**
     * @notice Returns CSS for text roller animation
     */
    function getCSS() external pure returns (string memory) {
        return _getCSSKeyframes();
    }

    function _getCSSKeyframes() internal pure returns (string memory) {
        return
            "@keyframes animation{0%,100%{top:0}20%{top:0}25%{top:-30px}45%{top:-30px}50%{top:-60px}70%{top:-60px}}";
    }

    function _getJavaScriptInit() internal pure returns (string memory) {
        return
            "const c=document.getElementById('c');const ctx=c.getContext('2d');const h=document.getElementById('hidden');const hctx=h.getContext('2d');const img=new Image();img.src='data:image/svg+xml;base64,'+cloudSVG;const cfg={hoverRadius:50,dotFadeTime:2000,dotSpacing:8,dotSize:16,lineStep:4,cloudThreshold:180,transitionZone:40,colors:['#66c800','#fea8cd','#3c8aff']};let mouseX=-1000,mouseY=-1000;const dotLastActive=new Map();c.addEventListener('mousemove',(e)=>{const rect=c.getBoundingClientRect();mouseX=e.clientX-rect.left;mouseY=e.clientY-rect.top;});c.addEventListener('mouseleave',()=>{mouseX=-1000;mouseY=-1000;});img.onload=()=>{h.width=c.width;h.height=c.height;hctx.drawImage(img,0,0,c.width,c.height);animate();};";
    }

    function _getJavaScriptAnimate() internal pure returns (string memory) {
        return
            "function animate(){ctx.clearRect(0,0,c.width,c.height);for(let x=0;x<c.width;x+=cfg.lineStep){const gradient=ctx.createLinearGradient(x,0,x,c.height);for(let y=0;y<c.height;y+=10){const p=hctx.getImageData(x,y,1,1).data;const r=p[0],g=p[1],b=p[2],brightness=(r+g+b)/3,a=p[3]/255;let lineOpacity;if(brightness<cfg.cloudThreshold-cfg.transitionZone){lineOpacity=(brightness/255)*a*0.9;}else if(brightness>=cfg.cloudThreshold){lineOpacity=0;}else{const fadeAmount=(cfg.cloudThreshold-brightness)/cfg.transitionZone;lineOpacity=(brightness/255)*a*0.9*fadeAmount;}gradient.addColorStop(y/c.height,`rgba(${r},${g},${b},${lineOpacity})`);}ctx.strokeStyle=gradient;ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,c.height);ctx.stroke();}";
    }

    function _getJavaScriptDots() internal pure returns (string memory) {
        return
            "const now=Date.now();for(let x=0;x<c.width;x+=cfg.dotSpacing){for(let y=0;y<c.height;y+=cfg.dotSpacing){const p=hctx.getImageData(x,y,1,1).data;const brightness=(p[0]+p[1]+p[2])/3;if(brightness>=cfg.cloudThreshold)continue;let edgeFade=1;if(brightness>cfg.cloudThreshold-cfg.transitionZone){edgeFade=(cfg.cloudThreshold-brightness)/cfg.transitionZone;}const dx=x-mouseX,dy=y-mouseY,distance=Math.sqrt(dx*dx+dy*dy);const dotKey=`${x},${y}`;const dotSeed=(x*7+y*13)%100;const variableRadius=cfg.hoverRadius+(dotSeed-50)*0.3;const softEdge=20;if(distance<variableRadius+softEdge){const activationChance=1-Math.max(0,(distance-variableRadius)/softEdge);if(Math.random()<activationChance||distance<variableRadius){dotLastActive.set(dotKey,now);}}const lastActive=dotLastActive.get(dotKey);if(lastActive&&now-lastActive<cfg.dotFadeTime){const timeSinceActive=now-lastActive;const colorIndex=Math.floor((x/c.width)*cfg.colors.length)%cfg.colors.length;const baseColor=cfg.colors[colorIndex];const r=parseInt(baseColor.slice(1,3),16),g=parseInt(baseColor.slice(3,5),16),b=parseInt(baseColor.slice(5,7),16);const fadeFactor=distance>=variableRadius?Math.max(0,1-timeSinceActive/cfg.dotFadeTime):1-(distance/variableRadius)**2;const size=(brightness/255)*cfg.dotSize*fadeFactor;if(size>0.5&&fadeFactor>0.1){const finalOpacity=fadeFactor*0.3*edgeFade;ctx.fillStyle=`rgba(${r},${g},${b},${finalOpacity})`;ctx.beginPath();ctx.arc(x,y,size/2,0,Math.PI*2);ctx.fill();}}else if(lastActive){dotLastActive.delete(dotKey);}}}requestAnimationFrame(animate);}";
    }
}
