import { createApp } from "vue";
import App from "./App.vue";
import "./registerServiceWorker";
import router from "./router";
import store from "./store";
import "primeflex/primeflex.css";
import "primeicons/primeicons.css";
import "primevue/resources/themes/saga-blue/theme.css";
import "primevue/resources/primevue.min.css";
import Menubar from "primevue/menubar";
import Button from "primevue/button";
import InputText from "primevue/inputtext";
import Password from "primevue/password";
import Tooltip from "primevue/tooltip";
import Checkbox from "primevue/checkbox";
import Toast from "primevue/toast";
import ToastService from "primevue/toastservice";

const app = createApp(App);

app.use(ToastService);

app.directive("tooltip", Tooltip);

app.component("Menubar", Menubar);
app.component("Button", Button);
app.component("InputText", InputText);
app.component("Password", Password);
app.component("Checkbox", Checkbox);
app.component("Toast", Toast);

app.use(store);
app.use(router);

app.mount("#app");
