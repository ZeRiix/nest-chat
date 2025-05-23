import { createWebHistory, createRouter } from "vue-router";
import { homePage, notFoundPage } from "@/domains/naviguation/router";
import { loginOrRegisterPage } from "@/domains/user/router";
import { chatPage } from "@/domains/chat/router";

export const router = createRouter({
	history: createWebHistory(),
	routes: [
		{
			path: "/",
			component: () => import("../layouts/BaseLayout.vue"),
			children: [
				homePage.recordRaw,
				loginOrRegisterPage.recordRaw,
				chatPage.recordRaw,
				notFoundPage.recordRaw,
			],
		},
	],
	scrollBehavior(_to, _from, savedPosition) {
		if (savedPosition) {
			return savedPosition;
		} else {
			return { top: 0 };
		}
	},
});

const { enableLoader, disableLoader } = useLoader();

router.beforeEach((_to, _from, next) => {
	enableLoader("routerLoadPage");
	next();
});

router.afterEach(() => {
	disableLoader("routerLoadPage");
});
