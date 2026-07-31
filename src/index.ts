type Handle = () => Promise<string>
const fullname = 'Dư Thanh Được'
const person: { name: string } = { name: fullname }
const handle: Handle = () => Promise.resolve(fullname)
handle().then(console.log)
