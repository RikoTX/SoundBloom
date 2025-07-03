import { Layout } from 'antd';
const { Footer } = Layout;





export default function FooterPage() {

    const footerStyle = {
        marginTop: '100px',
        color: 'black',
        backgroundColor: '#121212',
        padding: '12px',
        height: '44%',
        boxShadow: '1px 0 40px rgb(45, 45, 45)',
    }

    const containerStyle = {
        width: '30%',
        padding: '10px',
    };

    const aboutText = {
        fontSize: '14px',
        color: 'white'
    };

    const footerContainer = {
        display: 'flex',
        justifyContent: 'space-between',
        padding: '0 30px'

    }

    const textFlex = {
        display: 'flex',
        justifyContent: 'space-between',
        gap: '50px',
    }
    const hrStyle = {
        width: '120%',
        padding: '0',
        height: '0',
        border: 'none',
        borderTop: ' 2px solid #fff',
        borderBottom: '2px solid #fff',
        margin: '0px 0px 10px -10px',
    }
    const imageDiv = {
        width: '300px',
        height: '150px',
        display: 'flex',
        justifyContent: 'center',
    }

    const centerText = {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '8px',
        marginTop: '10px',
    }






    return (
        <Footer style={footerStyle}>
            <div style={footerContainer}>
                <div style={containerStyle}>
                    <h1 style={{ color: 'white' }}>About</h1>
                    <p style={aboutText}>
                        SoundBloom is a website that was created recently.
                        Here, you can listen to and download songs for free across various genres.
                        From trending hits to hidden gems — there's something for every listener.

                        If you don't want any restrictions, you can purchase our <a href='#'>premium pass.</a>
                        It gives you unlimited downloads, high-quality audio, and a fully ad-free experience.

                        Discover music your way — only on SoundBloom.
                    </p>
                </div>

                <div style={textFlex}>
                    <div>
                        <div>
                            <h1 style={{ textAlign: 'center', color: 'white' }}>Melodies</h1>
                            <hr style={hrStyle} />
                            <div style={
                                centerText
                            }>
                                <a href="#" style={{ color: 'white', textDecoration: 'none' }}>Songs</a>
                                <a href="#" style={{ color: 'white', textDecoration: 'none' }}>Radio</a>
                                <a href="#" style={{ color: 'white', textDecoration: 'none' }}>Podcast</a>
                            </div>
                        </div>

                    </div>
                    <div>
                        <div>
                            <h1 style={{ textAlign: 'center', color: 'white' }}>Access</h1>
                            <hr style={hrStyle} />
                            <div style={centerText}>
                                <a href="#" style={{ color: 'white', textDecoration: 'none' }}>Explor</a>
                                <a href="#" style={{ color: 'white', textDecoration: 'none' }}>Artists</a>
                                <a href="#" style={{ color: 'white', textDecoration: 'none' }}>Playlists</a>
                                <a href="#" style={{ color: 'white', textDecoration: 'none' }}>Albums</a>
                                <a href="#" style={{ color: 'white', textDecoration: 'none' }}>Trending</a>
                            </div>
                        </div>

                    </div>
                    <div>
                        <div>
                            <h1 style={{ textAlign: 'center', color: 'white' }}>Contact</h1>
                            <hr style={hrStyle} />
                            <div style={centerText}>
                                <a href="#" style={{ color: 'white', textDecoration: 'none' }}>About</a>
                                <a href="#" style={{ color: 'white', textDecoration: 'none' }}>Policy</a>
                                <a href="#" style={{ color: 'white', textDecoration: 'none' }}>Social Media</a>
                                <a href="#" style={{ color: 'white', textDecoration: 'none' }}>Soppurt</a>
                            </div>
                        </div>

                    </div>
                </div>

                <div>
                    <div style={imageDiv}>
                        <img
                            src="soundBloom.png"
                            alt="SoundBloom"
                            style={{
                                maxWidth: '70%',
                                alignSelf: 'center',
                            }}
                        />
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0 30px' }}>
                        <a href="#" target="_blank" rel="noopener noreferrer">
                            <img src="FooterContactIcons/facebook1.png" style={{ width: '40px', height: '40px' }} alt="" />
                        </a>
                        <a href="#" target="_blank" rel="noopener noreferrer">
                            <img src="FooterContactIcons/instagram.png" alt="" />
                        </a>

                        <a href="#" target="_blank" rel="noopener noreferrer">
                            <img src="FooterContactIcons/twitter.png" alt="" />
                        </a>
                        <a href="#" target="_blank" rel="noopener noreferrer">
                            <img src="FooterContactIcons/phone.png" style={{ width: '50px', height: '35px' }} alt="" />
                        </a>
                    </div>
                </div>
            </div>
        </Footer>
    )
}