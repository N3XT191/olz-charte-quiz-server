const route = require("koa-route");
const seedrandom = require("seedrandom");
var moment = require("moment");

const data = require("./data");
let scores = [];

const stuff = [
	route.get(`/questions/:code`, async function(ctx, code) {
		const deobfCode = (parseInt(Buffer.from(code, "base64").toString()) - 19654) / 23;
		const rounds = deobfCode % 10;
		const difficulty = ((deobfCode % 100) - rounds) / 10;
		const seed = (deobfCode - rounds - 10 * difficulty) / 100;

		const rng = seedrandom(seed);

		const allQuestions = data.questions[difficulty - 1];
		let randomNumbers = [];
		while (randomNumbers.length < rounds) {
			const newRandom = Math.floor(rng() * allQuestions.length);
			if (randomNumbers.findIndex((entry) => entry === newRandom) === -1) {
				randomNumbers.push(newRandom);
			}
		}
		const selectedQuestions = randomNumbers.map((number) => {
			const rightAnswer = data.maps.find((map) => map.id === allQuestions[number].map);
			const wrongAnswers = data.maps
				.filter((map) => map.id !== allQuestions[number].map)
				.sort(() => 0.5 - rng())
				.slice(0, 7);
			const allAnswers = wrongAnswers.concat(rightAnswer).sort(() => 0.5 - rng());
			return { img_url: "/maps/" + allQuestions[number].img + ".png", answers: allAnswers };
		});
		ctx.response.status = 200;
		ctx.body = selectedQuestions;
	}),
	route.get(`/answers/:code`, async function(ctx, code) {
		const deobfCode = (parseInt(Buffer.from(code, "base64").toString()) - 19654) / 23;
		const rounds = deobfCode % 10;
		const difficulty = ((deobfCode % 100) - rounds) / 10;
		const seed = (deobfCode - rounds - 10 * difficulty) / 100;

		const rng = seedrandom(seed);

		const allQuestions = data.questions[difficulty - 1];
		let randomNumbers = [];
		while (randomNumbers.length < rounds) {
			const newRandom = Math.floor(rng() * allQuestions.length);
			if (randomNumbers.findIndex((entry) => entry === newRandom) === -1) {
				randomNumbers.push(newRandom);
			}
		}
		let answers = [];
		randomNumbers.forEach((number) => {
			const rightAnswer = data.maps.find((map) => map.id === allQuestions[number].map);
			answers.push(rightAnswer);
		});
		ctx.response.status = 200;
		ctx.body = answers;
	}),
	route.get(`/ranking/:code`, async function(ctx, code) {
		console.log(scores);
		const ranking = scores
			.filter((score) => {
				const timeDiff = moment.duration(moment().diff(score.time)).asHours();
				return score.code === code && timeDiff <= 1;
			})
			.sort((a, b) => b.score - a.score);
		ctx.response.status = 200;
		ctx.body = ranking;
	}),
	route.post(`/score`, async function(ctx) {
		const scoreData = ctx.request.body;
		if (!(typeof scoreData.score !== "undefined" && scoreData.name && scoreData.seed)) {
			ctx.response.status = 400;
			ctx.body = {
				message: `ERROR`,
				success: false,
			};
			return;
		}

		const code = scoreData.seed;
		scores.push({ time: moment(), code, name: scoreData.name, score: scoreData.score });

		console.log(scores);

		ctx.response.status = 200;
		return;
	}),
];

module.exports = stuff;
