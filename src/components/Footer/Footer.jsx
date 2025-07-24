import { Layout, Row, Col } from 'antd';

const { Footer } = Layout;

export default function FooterPage() {
  const footerStyle = {
    marginTop: '100px',
    color: 'black',
    backgroundColor: '#181818',
    padding: '12px',
    height: '44%',
    boxShadow: '1px 0 40px rgb(8, 8, 8)',
  };

  const containerStyle = {
    width: '100%',
    padding: '10px',
  };

  const aboutText = {
    fontSize: '14px',
    color: 'white',
  };

  const hrStyle = {
    width: '120%',
    padding: '0',
    height: '0',
    border: 'none',
    borderTop: '2px solid #fff',
    borderBottom: '2px solid #fff',
    margin: '0px 0px 10px -10px',
  };

  const imageDiv = {
    width: '100%',
    height: '150px',
    display: 'flex',
    justifyContent: 'center',
  };

  const centerText = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '8px',
    marginTop: '10px',
  };

  const linkStyle = { color: 'white', textDecoration: 'none' };

  return (
    <Footer style={footerStyle}>
      <Row justify="space-between" style={{ padding: '0 30px' }} gutter={[16, 16]}>
        <Col xs={24} sm={12} md={8} lg={6}>
          <div style={containerStyle}>
            <h1 style={{ color: 'white' }}>About</h1>
            <p style={aboutText}>
              SoundBloom is a website that was created recently. Here, you can listen to and download songs for free across various genres.
              From trending hits to hidden gems — there's something for every listener.
              If you don't want any restrictions, you can purchase our <a href="#">premium pass.</a>
              It gives you unlimited downloads, high-quality audio, and a fully ad-free experience.
              Discover music your way — only on SoundBloom.
            </p>
          </div>
        </Col>

        <Col xs={24} sm={12} md={16} lg={12}>
          <Row gutter={32} style={{ display: 'flex', justifyContent: 'center' }}>
            <Col>
              <h1 style={{ textAlign: 'center', color: 'white' }}>Melodies</h1>
              <hr style={hrStyle} />
              <div style={centerText}>
                <a href="#" style={linkStyle}>Songs</a>
                <a href="#" style={linkStyle}>Radio</a>
                <a href="#" style={linkStyle}>Podcast</a>
              </div>
            </Col>
            <Col>
              <h1 style={{ textAlign: 'center', color: 'white' }}>Access</h1>
              <hr style={hrStyle} />
              <div style={centerText}>
                <a href="#" style={linkStyle}>Explor</a>
                <a href="#" style={linkStyle}>Artists</a>
                <a href="#" style={linkStyle}>Playlists</a>
                <a href="#" style={linkStyle}>Albums</a>
                <a href="#" style={linkStyle}>Trending</a>
              </div>
            </Col>
            <Col>
              <h1 style={{ textAlign: 'center', color: 'white' }}>Contact</h1>
              <hr style={hrStyle} />
              <div style={centerText}>
                <a href="#" style={linkStyle}>About</a>
                <a href="#" style={linkStyle}>Policy</a>
                <a href="#" style={linkStyle}>Social Media</a>
                <a href="#" style={linkStyle}>Soppurt</a>
              </div>
            </Col>
          </Row>
        </Col>

        <Col xs={24} md={24} lg={6}>
          <div style={imageDiv}>
            <img
              src={`${import.meta.env.BASE_URL}soundBloom.png`}
              alt="SoundBloom"
              style={{ maxWidth: '70%', alignSelf: 'center' }}
            />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0 30px', marginTop: '10px' }}>
            <a href="#" target="_blank" rel="noopener noreferrer">
              <img src={`${import.meta.env.BASE_URL}FooterContactIcons/facebook1.png`} style={{ width: '40px', height: '40px' }} alt="fb" />
            </a>
            <a href="#" target="_blank" rel="noopener noreferrer">
              <img src={`${import.meta.env.BASE_URL}FooterContactIcons/instagram.png`} alt="ig" />
            </a>
            <a href="#" target="_blank" rel="noopener noreferrer">
              <img src={`${import.meta.env.BASE_URL}FooterContactIcons/twitter.png`} alt="tw" />
            </a>
            <a href="#" target="_blank" rel="noopener noreferrer">
              <img src={`${import.meta.env.BASE_URL}FooterContactIcons/phone.png`} style={{ width: '50px', height: '35px' }} alt="ph" />
            </a>
          </div>
        </Col>
      </Row>
    </Footer>
  );
}
