import { ServiceBroker } from "moleculer";
import config from "./moleculer.config";
import GreeterService from "./services/greeter.service";

const broker = new ServiceBroker(config);

broker.createService(GreeterService);

broker.start().then(() => {
    console.log("Moleculer broker started");
});
