// TODO Move API KEY to
const API_KEY = 'd5f9b4d703cd6f1787b7689757b0bb8e57eb5a1ce203517f98d68cb2c569bd03'
const AGGREGATE_INDEX = '5'

const tickersHandlers = new Map() // {}
const socket = new WebSocket(`wss://streamer.cryptocompare.com/v2?api_key=${API_KEY}`)

socket.addEventListener('message', (e) => {
  const { TYPE: type, FROMSYMBOL: currency, PRICE: newPrice } = JSON.parse(e.data)

  if (type !== AGGREGATE_INDEX || newPrice === undefined) {
    return
  }

  const handlers = tickersHandlers.get(currency) ?? []
  handlers.forEach((fn: any) => fn(newPrice))
})

function sendToWebSocket(message: object) {
  const stringifiedMessage = JSON.stringify(message)

  if (socket.readyState === WebSocket.OPEN) {
    socket.send(stringifiedMessage)
    return
  }

  socket.addEventListener(
    'open',
    () => {
      socket.send(stringifiedMessage)
    },
    { once: true }
  )
}

function subscribeToTickerOnWs(ticker: string) {
  sendToWebSocket({
    action: 'SubAdd',
    subs: [`5~CCCAGG~${ticker}~USD`]
  })
}

function unsubscribeFromTickerOnWs(ticker: string) {
  sendToWebSocket({
    action: 'SubRemove',
    subs: [`5~CCCAGG~${ticker}~USD`]
  })
}

export const subscribeToTicker = (ticker: string, cb: any) => {
  const subscribers = tickersHandlers.get(ticker) || []
  tickersHandlers.set(ticker, [...subscribers, cb])
  subscribeToTickerOnWs(ticker)
}

export const unsubscribeFromTicker = (ticker: string) => {
  tickersHandlers.delete(ticker)
  unsubscribeFromTickerOnWs(ticker)
}
