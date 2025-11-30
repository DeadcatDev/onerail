import Container from 'react-bootstrap/Container';
import { useAuth } from './auth/AuthContext';
import Login from './pages/Login';
import Account from './pages/Account';

function App() {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <Container className="py-5">
                <p>Loading…</p>
            </Container>
        );
    }

    if (!user) {
        return <Login />;
    }

    return <Account />;
}

export default App;
