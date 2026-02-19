import type { ServiceSchema } from "moleculer";

const GreeterService: ServiceSchema = {
    name: "greeter",
    actions: {
        hello() {
            return "Hello from Moleculer";
        }
    }
};

export default GreeterService;
