"use client"

export default function Practice() {
    const numbers = [1,2,3,4]
    const doubled = numbers.map (n => n * 2);

    const users = [{name: 'Andrew'}, {name: 'Bryan'}]
    const names = users.map (user => user.name)

    const commodities = [{id: "fish", price: 20}, {id: "meat", price: 40}, {id: "poultry", price: 60}]
    const updated = commodities.map((c) => ({...c, price: c.price + 2}))

    const numberz = [100, 200, 300]
    const [first, second] = numberz

    const person = {firstName: "John", age: 30}
    const {firstName} = person

    const pairList = [['tea', 3], ['oil', 1]];


    return (
        <div>
            <div>
                <p> the doubled numbers are {doubled.join(",")}</p>
            </div>
            <div>
                <p> the names are {names.join (", ")}</p>
            </div>
            <div>
                <ul> 
                    {updated.map((c) => (
                        <li key={c.id}>{c.id} is now ${c.price}</li>
                    ))}
                </ul>
            </div>
            <div>
                <p>this is the {first} and this is the {second}</p>
                <p>the first name is {firstName}</p>
            </div>
            <div>
                <ul>
                    {pairList.map(([id, quantity]) => (
                    <li key={id}>{id} & {quantity}</li>
                    ))}
                </ul>
            </div>
        </div>
    )
}