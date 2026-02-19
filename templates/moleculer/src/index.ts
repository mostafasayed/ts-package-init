import { ServiceBroker } from "moleculer";

const broker = new ServiceBroker({
    logger: console
});

broker.start().then(() => {
    console.log("Moleculer broker started");
});
