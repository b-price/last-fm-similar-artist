import React, {useEffect, useState} from 'react';
//import spotifyProfileData from './data/StreamingHistory_music_0.json' with { type: 'json' };
import spotifyAPIData from './data/top50artists.json' with { type: 'json' };
import { Form, Button, ListGroup, Alert } from 'react-bootstrap';

const API_KEY = import.meta.env.VITE_LASTFM_API_KEY;

const SimilarArtists: React.FC = () => {
    const [artist, setArtist] = useState('');
    const [similarArtists, setSimilarArtists] = useState<string[]>([]);
    const [top50artists, setTop50artists] = useState<string[]>([]);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        setTop50artists(spotifyAPIData.map(artist => artist.name.toLowerCase()));
    }, []);

    const fetchSimilarArtists = async (getNew: boolean) => {
        if (!artist) return;

        try {
            const response = await fetch(
                `https://ws.audioscrobbler.com/2.0/?method=artist.getsimilar&artist=${encodeURIComponent(artist)}&api_key=${API_KEY}&format=json`
            );

            const data = await response.json();

            if (data.error) {
                setError(data.message || 'Error fetching data.');
                setSimilarArtists([]);
            } else {
                if (getNew) {
                    const names = data.similarartists.artist
                        .map((a: { name: string; }) => a.name)
                        .filter((name: string) => !top50artists.includes(name.toLowerCase()));
                    if (names.length > 1) {
                        setSimilarArtists(names);
                        setError(null);
                    } else {
                        setError(`You've listened to all the similar artists!`);
                        setSimilarArtists([]);
                    }
                } else {
                    const names = data.similarartists.artist.map((a: { name: string; }) => a.name);
                    setSimilarArtists(names);
                    setError(null);
                }

            }
        } catch {
            setError('Failed to fetch data.');
            setSimilarArtists([]);
        }
    };



    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        fetchSimilarArtists(false);
    };

    const handleGetNew = () => {
        fetchSimilarArtists(true);
    }

    return (
        <>
            <Form onSubmit={handleSubmit} className="mb-3">
                <Form.Group controlId="artistInput">
                    <Form.Label>Enter Artist Name</Form.Label>
                    <Form.Control
                        type="text"
                        value={artist}
                        onChange={(e) => setArtist(e.target.value)}
                        placeholder="e.g., Radiohead"
                    />
                </Form.Group>
                <Button variant="primary" type="submit" className="mt-2">
                    Get Similar Artists
                </Button>
            </Form>

            <Button variant="success" className="mb-2" onClick={handleGetNew}>
                Get New Similar Artists
            </Button>

            {error && <Alert variant="danger">{error}</Alert>}

            {similarArtists.length > 0 && (
                <ListGroup>
                    {similarArtists.map((name, idx) => (
                        <ListGroup.Item key={idx}>{name}</ListGroup.Item>
                    ))}
                </ListGroup>
            )}
        </>
    );
};

export default SimilarArtists;
