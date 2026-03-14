import "../styles/TopBar.css";

type TopBarProps = {
    userName: string;
};

export default function TopBar({ userName }: TopBarProps) {
    const initial = userName.charAt(0).toUpperCase();

    return (
        <nav className="topbar">
            <div className="topbar-brand-wrap">
                <button className="menu-btn" type="button" aria-label="Åpne meny">
                    ☰
                </button>

                <div className="topbar-brand">accenture</div>
            </div>

            <div className="topbar-user">
                <span>{userName}</span>
                <span className="avatar">{initial}</span>
            </div>
        </nav>
    );
}