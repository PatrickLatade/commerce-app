"use client"

export default function Destructure() {
    const pairs: [string, number][] =  [['tea', 3,], ['oil', 5], ['gold', 0]];

    //1. .map
    const rendered = pairs.map(([id, qty]) => `${id}: ${qty}` )

    //2. .reduce
    const totalQty = pairs.reduce((sum, [id, qty]) => sum + qty, 0);

    //3. .forEach
    pairs.forEach(([id,qty]) => console.log(id, qty));

    //4. for...of
    for (const [id, qty] of pairs){
        console.log(id, qty);
    }

    //5. function parameter
    function show([id, qty]: [string, number]) {
        console.log(`Item ${id} has ${qty}`);
    }
    pairs.forEach(show)

    return (
        <div>
            <div>
                <p>{rendered.join (", ")}</p>
            </div>
            <div>
                <ul>
                    {pairs.map(([id, qty]) => (
                        <li key={id}>{id}: {qty}</li>
                    ))}
                </ul>
                <p>sum is {totalQty}</p>
            </div>
        </div>
    )
}