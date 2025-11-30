import Container from 'react-bootstrap/Container';
import Button from 'react-bootstrap/Button';
import Card from 'react-bootstrap/Card';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import { Link, NavLink, Route, Routes } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import Organization from './Organization';
import MyOrders from './MyOrders';

function Account() {
    const { user, logout } = useAuth();
    return (
        <>
            <Navbar bg="light" expand="md" className="mb-4">
                <Container>
                    <Navbar.Brand as={Link} to="/">
                        Me
                    </Navbar.Brand>
                    <Nav className="me-auto">
                        <Nav.Link as={NavLink} to="/organization">
                            My organization
                        </Nav.Link>
                        <Nav.Link as={NavLink} to="/orders">
                            My orders
                        </Nav.Link>
                        <Nav.Link
                            href="/api/swagger"
                            target="_blank"
                            rel="noreferrer"
                        >
                            Swagger
                        </Nav.Link>
                    </Nav>
                    <Nav>
                        <Navbar.Text className="me-3">
                            Signed in as {user?.firstName} {user?.lastName}
                        </Navbar.Text>
                        <Button
                            size="sm"
                            variant="outline-secondary"
                            onClick={logout}
                        >
                            Log out
                        </Button>
                    </Nav>
                </Container>
            </Navbar>
            <Container className="pb-5">
                <Routes>
                    <Route
                        path="/"
                        element={
                            <Card>
                                <Card.Body>
                                    <h1 className="mb-3">
                                        Welcome, {user?.firstName}{' '}
                                        {user?.lastName}
                                    </h1>
                                  <p className="mb-2">
                                    <strong>Id:</strong> {user?.id}
                                  </p>
                                    <p className="mb-2">
                                        <strong>Email:</strong> {user?.email}
                                    </p>
                                    <p className="mb-3">
                                        <strong>Create date:</strong>{' '}
                                        {user?.dateCreated
                                            ? new Date(
                                                  user.dateCreated,
                                              ).toLocaleDateString()
                                            : 'Unknown'}
                                    </p>
                                </Card.Body>
                            </Card>
                        }
                    />
                    <Route path="/organization" element={<Organization />} />
                    <Route path="/orders" element={<MyOrders />} />
                </Routes>
            </Container>
        </>
    );
}

export default Account;
