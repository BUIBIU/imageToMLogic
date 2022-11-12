import Worker from './test.worker'
export default class WorkerController {
  onStart = () => {}
  onPercentage = () => {}
  onEnd = () => {}
  onError = () => {}
  worker = null
  constructor(onStart, onPercentage, onEnd, onError) {
    this.onStart = onStart
    this.onPercentage = onPercentage
    this.onEnd = onEnd
    this.onError = onError
  }
  run(data) {
    const worker = new Worker()
    this.worker = worker
    worker.postMessage(data)
    worker.addEventListener('message', e => {
      const { state, data } = e.data
      switch (state) {
        case 'start':
          this.onStart()
          break
        case 'percentage':
          this.onPercentage(data)
          break
        case 'end':
          worker.terminate();
          this.onEnd(data)
          break
        case 'error':
          worker.terminate();
          this.onError(data)
          break
      }
    })
  }
}
