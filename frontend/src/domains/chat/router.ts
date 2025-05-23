export const chatPage = createPage(
	"chat",
	{
		path: "/chat",
		component: () => import("./pages/ChatPage.vue"),
	},
);
