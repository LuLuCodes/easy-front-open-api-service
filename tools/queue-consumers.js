const Bull = require('Bull');

const goodsQueue = new Bull('goods-info-sync-queue', {
  prefix: 'liyu',
  redis: {
    host: '127.0.0.1',
    port: 6379,
    db: 2,
  },
});

goodsQueue.process(async (job, done) => {
  console.log(job.id);
  console.log(job.data);
  // done(new Error('not ok'));
  // console.log('============');

  done();
  // const options = {
  //   ...job.opts,
  //   delay: 30000,
  // };
  job.data.retry++;
  await goodsQueue.add(job.data, {
    attempts: 3,
    jobId: `goods-sync@#_#@${Date.now()}`,
    delay: 3000,
    removeOnComplete: true,
    removeOnFail: true,
  });
});
