export interface LoadingProps {
	open?: boolean

	preset?: "light" | "dark"
}

export interface LoadingMethods {
	display: () => void,
	hide: () => void,
}
