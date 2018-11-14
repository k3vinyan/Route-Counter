let routes = [];
let selectedRoutes = [];
let clusters = [];

console.dir($)
console.dir($.modal)

$('#file').change(function(){
    const file = $(this)[0].files['0']
    
    Papa.parse(file, {
        header: true,
        complete: function(results){
            for(let i = 0; i < results.data.length; i++){
                let route = results.data[i].Route;
                let associate = results.data[i].Associate;

                
                let routeCount = 0;
                let clusterCount = 0;
                if(route != undefined && route != ''){
                    let cluster = route.replace(/[0-9]/g, '')

                    routes.map(function(item){
                        if(item.route === route){
                            item.count++
                            routeCount++
                        }
                    })

                    if(routeCount === 0){
                        if(associate === "" || associate === "OMW-USER/FLEX"){
                            routes.push({
                                route: route,
                                count: 1,
                                cluster: cluster,
                                flexRoute: true
                            })
                        } else {
                            routes.push({
                                route: route,
                                count: 1,
                                cluster: cluster,
                                flexRoute: false
                            })
                        }
                        
                    }
                    
                    clusters.map(function(item){
                        if(item === cluster){
                            clusterCount++
                        }
                    })
                    if(clusterCount === 0){
                        clusters.push(cluster)
                    }
                    clusterCount = 0;
                    routeCount = 0;
                }
                
            }
            let filename = file.name;
            $('#labelfile')[0].innerHTML = filename;
            createTable(routes)

            for(let i = 0; i < clusters.length; i++){
                let option = $('<option></option>').attr("value", clusters[i]).text(clusters[i]);

                $('#selectId').append(option)
            }

            
        }
    })
})

$('#selectId').change(function(){
    selectedRoutes = [];

    const selectedCluster = $('#selectId')[0].value;

    for(let i = 0; i < routes.length; i++){
        if(selectedCluster === routes[i].cluster){
            selectedRoutes.push(routes[i])
        }
    }

    selectedRoutes.sort(function(a, b){
        return a.route.replace(/[A-Z]/g, '') - b.route.replace(/[A-Z]/g, '')
    })

    let table = "<table class='table'>" +
        "<thead>" +
            "<tr>" +
                "<th class='text-center'>Route</th><th class='text-center'>Count</th>" +
            "</tr>" +
        "</thead><tbody>"

    for(let i = 0; i < selectedRoutes.length; i++){
        table += "<tr><td class='text-center'>" + selectedRoutes[i].route + "</td><td class='text-center'>" + 
        selectedRoutes[i].count + "</td></tr>"
    }

    table += "</tbody></table>";
    
    $('#tableContainer').hide('slide', { direction: 'right' })
    $('#tableContainer').html(table)
    setTimeout(function(){
        $('#tableContainer').show('slide', { direction: 'right' })
    }, 750)
   
})

$('#dlExcel').click(function(){
    const routeTotal = selectedRoutes.length;

    if(routeTotal === 0){
        $("#warning").modal();
    } else {
        const workbook = $JExcel.new();
        const headerStyle = workbook.addStyle({border: "none,none,none,thin #551A8B",font: "Calibri 12 #FFFFFF B", fill: "#000000", align: "C C"});
        let style = workbook.addStyle({border: "thin, thin, thin, thin #333333", align: "C C"})

        let j = 0;
        for(let i = 0; i < Math.ceil(routeTotal/39) + 1;i++ ){
            workbook.set(0, j, undefined, 6)
            workbook.set(0, j+1, undefined, 6)
            workbook.set(0, j+2, undefined, 4)
            j += 3
        }

        let k = 0; let n = 1; let r = 0;
        for(let i = 0; i < selectedRoutes.length; i++){
            if(selectedRoutes[i].flexRoute){
                style = workbook.addStyle({border: "thin, thin, thin, thin #333333", align: "C C"})
            } else {
                style = workbook.addStyle({border: "thin, thin, thin, thin #333333", align: "C C", fill: "#FFFF00"})
            }
            if(i%39 === 0 && i != 0){
                k += 3;
                n += 38;
                r += 1;
            }

            workbook.set(0, k, 0, 'Route', headerStyle);
            workbook.set(0, k+1, 0, 'Count', headerStyle);
            workbook.set(0, k, i-n-r, selectedRoutes[i].route, style);
            workbook.set(0, k+1, i-n-r, selectedRoutes[i].count, style);
        }

        let date = new Date();
        workbook.generate(date + '.xlsx');
    }
    
})

function createTable(data){
    let clusterTotal = {}

    for(let i = 0; i < data.length; i++){
        let route = data[i];
        if(clusterTotal[route.cluster] === undefined){
            clusterTotal[route.cluster] = {
                routeTotal: 1, 
                packageTotal: route.count
            };
        } else {
            clusterTotal[route.cluster].routeTotal++;
            clusterTotal[route.cluster].packageTotal += route.count;
        }
    }

    let table = "<table class='table'>" +
        "<thead>" +
            "<tr>" +
                "<th class='text-center'>Cluster</th>" +
                "<th class='text-center'>Total Routes</th>" +
                "<th class='text-center'>Total Packages</th>" +
            "</tr>" +
        "</thead><tbody>"

    for(cluster in clusterTotal){
        table += "<tr><td class='text-center'>" + cluster + "</td><td class='text-center'>" + 
        clusterTotal[cluster].routeTotal + "</td><td class='text-center'>" +
        clusterTotal[cluster].packageTotal + "</td></tr>"
    }

    table += "</tbody></table>";
    
    $('#tableContainer').html(table)
    $('#tableContainer').show('slide', { direction: 'left' })
    
}