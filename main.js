function draw(canvas, ctx, satpos, panelpos, earthpos, revolutionangle, earthsize) {

   
    function drawStar(cx, cy, spikes, outerRadius, innerRadius) {
        var rot = Math.PI / 2 * 3;
        var x = cx;
        var y = cy;
        var step = Math.PI / spikes;

        ctx.beginPath();
        ctx.moveTo(cx, cy - outerRadius)
        for (i = 0; i < spikes; i++) {
            x = cx + Math.cos(rot) * outerRadius;
            y = cy + Math.sin(rot) * outerRadius;
            ctx.lineTo(x, y)
            rot += step

            x = cx + Math.cos(rot) * innerRadius;
            y = cy + Math.sin(rot) * innerRadius;
            ctx.lineTo(x, y)
            rot += step
        }
        ctx.lineTo(cx, cy - outerRadius);
        ctx.closePath();
        ctx.lineWidth = 5;
        ctx.strokeStyle = 'white';
        ctx.stroke();
        ctx.fillStyle = 'white';
        ctx.fill();
    }

    ctx.strokeStyle = 'white'
    ctx.lineWidth = 5;
    ctx.fillStyle = 'white';

    // draw satellite
    drawStar(...satpos, 4, 20, 4);
    // ctx.beginPath();
    // ctx.arc(...satpos, 10, 0, 2 * Math.PI);
    // ctx.stroke()

    // draw ground station
    ctx.beginPath();
    ctx.arc(...panelpos, 10, 0, 2 * Math.PI);
    ctx.fill();



    // draw light path
    if ((satpos[1] < earthpos[1] - earthsize || satpos[1] > earthpos[1] + earthsize) || revolutionangle <= 0) { // satellite is not in earth's shadow
        ctx.beginPath();
        ctx.moveTo(canvas.width, satpos[1]);
        ctx.lineTo(...satpos);

        stationToEarth = [earthpos[0] - panelpos[0], earthpos[1] - panelpos[1]]
        stationToSatellite = [satpos[0] - panelpos[0], satpos[1] - panelpos[1]]
        // dot product
        let dot = stationToEarth[0] * stationToSatellite[0] + stationToEarth[1] * stationToSatellite[1]
        if (dot < 0) {
            ctx.lineTo(...panelpos);
        }

    }

    ctx.stroke();




    
}

createSatellites = function (total, canvas, ctx) {
    let offset = ((Math.PI * 2) / total)
    let satellites = []
    if (total < 5) {
        offset = ((Math.PI * .5) / total)
    }
    for (let i = 0; i < total; i++) {
        satellites.push(createSatellite(canvas, ctx, offset * i))
    }
    return satellites
}
window.onload = function () {
    fetch('./header.html').then(response => {
        response.text().then(text => {
            document.querySelector('body').prepend((new window.DOMParser()).parseFromString(text, 'text/html').querySelector('header'))
        })


    })

    let canvas = document.querySelector('canvas')
    
    let ctx = canvas.getContext('2d')
    let satellites = []
    let total = document.querySelector('#numsatellites').value
    satellites = createSatellites(total)
    document.querySelector('#numsatellites').addEventListener('change', (e) => {
        total = e.target.value
        satellites = createSatellites(total, canvas, ctx)
    })

    canvas.width = 5000
    canvas.height = 2000
    let theta = 0

    setInterval(() => {
        canvas.width = document.querySelector('.diagram').offsetWidth * 3.5
        canvas.height = window.innerHeight * .8 * 3.5
    
        let earthx = (canvas.width * .6) + (1/(canvas.width/window.outerWidth)) * 2200
        let earthpos = [earthx, canvas.height / 2]
        let earthsize = 200
        let panelpos = [earthpos[0] - earthsize, canvas.height / 2]
        theta += 0.01
        ctx.clearRect(0, 0, canvas.width, canvas.height);
                // draw earth
                ctx.fillStyle = 'white';
                ctx.beginPath();
                ctx.arc(...earthpos, earthsize, 0, 2 * Math.PI);
                ctx.fill();
                // earth's shadow
                const grad = ctx.createLinearGradient(0,0, earthpos[0] + (earthsize/2),0);
                grad.addColorStop(0, "transparent");
                grad.addColorStop(.9, "#000008AA");
                grad.addColorStop(.975, "#000008AA");
                grad.addColorStop(.9751, "transparent");
                ctx.beginPath();
                // ctx.moveTo(0, canvas.height/2);
                // ctx.lineTo(earthpos[0], earthpos[1]-(earthsize));
                // ctx.lineTo(earthpos[0], earthpos[1]+(earthsize));
                ctx.fillStyle = grad;
                ctx.fillRect(0, earthpos[1]-(earthsize), canvas.width, earthsize*2);
                ctx.fill();
        panelpos[0] = earthpos[0] + earthsize * -Math.cos(theta)
        panelpos[1] = earthpos[1] + earthsize * -Math.sin(theta)
        satellites.forEach(satellite => {
            satellite.theta += Math.max(document.querySelector('#orbitspeed').value * 0.01, 0.005)
            satellite.satpos[0] = earthpos[0] + satellite.r * -Math.cos(satellite.theta)
            satellite.satpos[1] = earthpos[1] + satellite.r * -Math.sin(satellite.theta)
            let revolutionangle = Math.atan2(satellite.satpos[1] - satellite.satpos[1], satellite.satpos[0] - earthpos[0]) //
            draw(canvas, ctx, satellite.satpos, panelpos, earthpos, revolutionangle, earthsize)
        })

    }, 16.67)


}

createSatellite = function (canvas, ctx, startingAngle = 0) {
    return {
        satpos: [0, 0],
        r: 600,
        theta: startingAngle
    }
}