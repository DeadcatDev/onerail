import React, { useState } from 'react';
import { useAuth } from '../auth/AuthContext';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';

export default function Login() {
    const { login, loading, error } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('onerail');
    const [localError, setLocalError] = useState<string | null>(null);

    const onSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLocalError(null);
        try {
            await login(email, password);
        } catch (err: any) {
            setLocalError(err?.message || 'Login failed');
        }
    };

    return (
        <Container className="py-5">
            <Row className="justify-content-center">
                <Col md={6} lg={5}>
                    <h1 className="mb-4 text-center">Sign in</h1>
                    <Form onSubmit={onSubmit}>
                        <Form.Group className="mb-3" controlId="email">
                            <Form.Label>Email</Form.Label>
                            <Form.Control
                                type="email"
                                placeholder="name@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </Form.Group>
                        <Form.Group className="mb-4" controlId="password">
                            <Form.Label>Password</Form.Label>
                            <Form.Control
                                type="password"
                                placeholder="onerail"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                            <Form.Text muted>The password is "onerail" for all users.</Form.Text>
                        </Form.Group>
                        {(error || localError) && (
                            <div className="alert alert-danger" role="alert">
                                {localError || error}
                            </div>
                        )}
                        <div className="d-grid">
                            <Button type="submit" variant="primary" disabled={loading}>
                                {loading ? 'Signing in…' : 'Sign in'}
                            </Button>
                        </div>
                    </Form>
                </Col>
            </Row>
        </Container>
    );
}
