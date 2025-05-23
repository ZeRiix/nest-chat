export const loginOrRegisterPage = createPage(
	"loginOrRegister",
	{
		path: "/login",
		component: () => import("./pages/LoginOrRegisterPage.vue"),
	},
);
