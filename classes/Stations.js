export default class Stations{
    constructor(data){
        this.data = data; 
    }
    getOrder(stat){
        return this.data[stat].order;
    }
    getArabicName(stat){
        return this.data[stat].ar;
    }
    getLocation(stat){
        return this.data[stat].location;
    }
    getLine(stat){
        return this.data[stat].line;
    }
    getTime(stat){
        return new Date(null, null, null, this.data[stat].time.split(":")[0], this.data[stat].time.split(":")[1]);
    }
    isOpen(stat){
        return this.data[stat].isOpen;
    }
    stationsCounter(stat1, stat2){
        
        let stat1Line = this.getLine(stat1),
            stat2Line = this.getLine(stat2),
            stat1Order = this.getOrder(stat1),
            stat2Order = this.getOrder(stat2);
        if(stat1Line == stat2Line){
            return Math.abs(stat1Order - stat2Order) + 1;
        }else{
            let nextInter = this.getNextInterchange(stat1,stat2);
            if(nextInter[0].split("_")[0].includes(nextInter[1].split("_")[0])){
                return Math.abs(stat1Order - this.getOrder(nextInter[0])) + Math.abs(stat2Order - this.getOrder(nextInter[1])) + 1; 
            }else{
                let secondPathStartStat = this.getStatInOtherLine(nextInter[0]),
                    secondPathStartEnd = this.getStatInOtherLine(nextInter[1]),
                    firstPath = Math.abs(stat1Order - this.getOrder(nextInter[0])),
                    thirdPath = Math.abs(stat2Order - this.getOrder(nextInter[1])),
                    secondPath = Math.abs(this.getOrder(secondPathStartStat) - this.getOrder(secondPathStartEnd));
                return firstPath + secondPath + thirdPath + 1;

            }
            

        }
    }
    getInterchange(stat){
        return this.data[stat].isInterchange !== 0;
    }
    // get the station name on the other line
    getStatInOtherLine(stat){
        if(this.getInterchange(stat)){
            let interchangeWith = this.data[stat].isInterchange.to;
            for( let x of this.data.interchangeStat[interchangeWith]){
                if(x.split("_")[0].includes(stat.split("_")[0])) return x;
            }
        }else{
            return "none";
        }
    }
    ticketPrice(stat1, stat2, pricesMap){
        let numOfStations = this.stationsCounter(stat1,stat2);
        for(const [nStations, price] of pricesMap){
            if(numOfStations <= nStations) return price;
        }
    }
    getNextInterchange(stat1,stat2){
        let nextForward = this.getBehindForwardInt(stat1,stat2);
        if(!nextForward.multiChange){
            let stat2Order = this.getOrder(stat2);

            let nextBehindStat = nextForward.behind.stat;
            let nextForwardStat = nextForward.forward.stat;
            let nextBehindStat2 = (nextBehindStat != "none")?this.getStatInOtherLine(nextBehindStat):undefined,
                nextForwardStat2= (nextForwardStat !="none")?this.getStatInOtherLine(nextForwardStat):undefined;

            if(nextBehindStat2 && nextForwardStat2){
                if(Math.abs(stat2Order - this.getOrder(nextBehindStat2)) < Math.abs(stat2Order - this.getOrder(nextForwardStat2))){
                    return [nextBehindStat,nextBehindStat2]
                }else{
                    return [nextForwardStat,nextForwardStat2]
                }
            }else{
                return nextBehindStat != "none" ? [nextBehindStat,nextBehindStat2] :  [nextForwardStat,nextForwardStat2];
            
            }
        }else{
            return nextForward.intStats.interchangeStat;

        }        

    }
    getIntStatsBetween(stat1, stat2){
        let stat1Line = this.getLine(stat1),
            stat2Line = this.getLine(stat2);
        const interchangeStat = this.data.interchangeStat[stat1Line].filter(el => this.data[el].isInterchange.to == stat2Line && this.data[el].isInterchange.status == 1);
        if(interchangeStat.length != 0){
            const orders = interchangeStat.map(el => this.getOrder(el));
            return {orders,interchangeStat};

        }else{

            let interchangeLine1,interchangeLine2,interchangeStat1,interchangeStat2;
            for(let stat of this.data.interchangeStat[stat1Line]){
                if(this.data[stat].isInterchange.status == 1){
                    interchangeLine1 = this.data[stat].isInterchange.to; 
                    // Checking if the interchange line exists in the second station line
                    interchangeLine2 = this.data.interchangeStat[stat2Line].filter(el => this.data[el].isInterchange.to == interchangeLine1 && this.data[el].isInterchange.status == 1);

                    if(interchangeLine2.length =! 0) {
                        interchangeStat1 = stat;
                        interchangeStat2 = interchangeLine2[0];
                        return {orders:[this.getOrder(interchangeStat1),this.getOrder(interchangeStat2)], interchangeStat:[interchangeStat1,interchangeStat2]}
                    }
                }
            }
        }
        
        
         // Return order and name of interchange stations regarding to the line of stat 1

    }
    getBehindForwardInt(stat1,stat2){
        let stat1Order =this.getOrder(stat1);
        const intStats = this.getIntStatsBetween(stat1,stat2);
        // Checking if there are more than one interchange between lines
        if(intStats.interchangeStat.every(e=>this.getLine(e) ==this.getLine(intStats.interchangeStat[0]))){
            let behind = stat1Order - Math.min.apply(null, intStats.orders.filter(el=> el < stat1Order).map(el=> stat1Order - el));
            let forward = Math.min.apply(null, intStats.orders.filter(el=> el > stat1Order).map(el=> el - stat1Order)) + stat1Order;
            let behindStat = intStats.interchangeStat[intStats.orders.indexOf(behind)];
            let forwardStat = intStats.interchangeStat[intStats.orders.indexOf(forward)];
            behindStat = behindStat? behindStat : "none";
            forwardStat = forwardStat? forwardStat : "none";
            return {behind:{order:behind, stat:behindStat}, forward:{order:forward, stat:forwardStat},multiChange:0};
        }else{
            return {intStats,multiChange:1}
        }
        
    }
    getStationsBetweenSameLine(stat1, stat2){
        let stat1Order = this.getOrder(stat1),
            stat2Order = this.getOrder(stat2);
        const allStations = Object.keys(this.data);
        let start = stat1Order < stat2Order ? allStations.indexOf(stat1) : allStations.indexOf(stat2);
            let len = Math.abs(stat1Order - stat2Order) + start;
            let stations ={
                line:this.getLine(stat1),
                stations:stat1Order < stat2Order ? allStations.slice(start, len + 1) : allStations.slice(start, len + 1).reverse()
            }
        return stations;


        

    }
    getStationsBetween(stat1, stat2){
        if(this.getLine(stat1) == this.getLine(stat2)){
            return [this.getStationsBetweenSameLine(stat1,stat2)];
        }else{
            let nextInter = this.getNextInterchange(stat1,stat2);
            if(nextInter[0].split("_")[0].includes(nextInter[1].split("_")[0])){
                const path1 = this.getStationsBetweenSameLine(stat1,nextInter[0]),
                      path2 = this.getStationsBetweenSameLine(nextInter[1], stat2);
                return [path1,path2]
            }else{
                const path1 = this.getStationsBetweenSameLine(stat1, nextInter[0]),
                      path2= this.getStationsBetweenSameLine(this.getStatInOtherLine(nextInter[0]),this.getStatInOtherLine(nextInter[1])),
                      path3 = this.getStationsBetweenSameLine(nextInter[1], stat2);
                return [path1, path2, path3];
            }
        }
        
    }
    getTimeBetween(stat1,stat2){
        let stat1Line = this.getLine(stat1),
        stat2Line = this.getLine(stat2);
        if(stat1Line == stat2Line){
            return Math.abs(this.getTime(stat1) - this.getTime(stat2)) / 1000 /60;
        }else{
            let nextInter = this.getNextInterchange(stat1,stat2);
            if(nextInter[0].split("_")[0].includes(nextInter[1].split("_")[0])){
                let dateDiff1 = Math.abs(this.getTime(stat1) - this.getTime(nextInter[0])) / 1000 /60;
                let dateDiff2 = Math.abs(this.getTime(stat2) - this.getTime(nextInter[1])) / 1000 /60;
                return dateDiff1 + dateDiff2; 
            }else{
                let dateDiff1 = Math.abs(this.getTime(stat1) - this.getTime(nextInter[0])) / 1000 /60;
                let dateDiff2 = Math.abs(this.getTime(this.getStatInOtherLine(nextInter[0])) - this.getTime(this.getStatInOtherLine(nextInter[0]))) / 1000 /60;
                let dateDiff3 = Math.abs(this.getTime(stat2) - this.getTime(nextInter[1])) / 1000 /60;
                return dateDiff1 + dateDiff2 + dateDiff3;
            }
            
        }

    }

}
