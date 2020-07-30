interface IStep { 
    rule: string; 
    value: string; 
    id: string; 
    position: string; 
    x: number; 
    y: number 
}
export default {
    parseData: (str: String) => {
        str = str.replace(".", "")
        let [ info, data, stepsStr ] = str.split('\n')
        let level = info[info.length - 1]
        let [ original, solved ] = data.split(';')
        let stepsArray = stepsStr.split(';')
        let letterToIndexMap: { [key: string]: number} = {
            'A' : 0,
            'B' : 1,
            'C' : 2,
            'D' : 3,
            'E' : 4,
            'F' : 5,
            'G' : 6,
            'H' : 7,
            'I' : 8
        }

        let steps: IStep[] = []

        stepsArray.forEach(step => {
            let [ first , rule, value ] = step.split(',')
            let [ id, position ] = first.split('-')
            let x = parseInt(position[1]) - 1
            let y = letterToIndexMap[position[0]]

            steps.push({ rule, value, id, position, x, y})
        })

        const result = { level, original, solved, steps }

        return result
    }
}