'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import type { GenerateRecipeOutput } from '@/ai/flows/generate-recipe';

export interface Folder {
    id: string;
    name: string;
}

export type RecipeFolderMap = Record<string, string | null>;

const getInitialState = <T,>(key: string, defaultValue: T): T => {
    if (typeof window === 'undefined') return defaultValue;
    try {
        const item = window.localStorage.getItem(key);
        return item ? JSON.parse(item) : defaultValue;
    } catch {
        return defaultValue;
    }
};

export function useFavorites() {
    const { data: session } = useSession();
    const isAuthenticated = !!session?.user?.id;

    const [favorites, setFavorites] = useState<GenerateRecipeOutput[]>([]);
    const [folders, setFolders] = useState<Folder[]>([]);
    const [recipeFolderMap, setRecipeFolderMap] = useState<RecipeFolderMap>({});
    const [favoriteIdMap, setFavoriteIdMap] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(true);

    // ── Load ───────────────────────────────────────────────────────────────
    useEffect(() => {
        if (isAuthenticated) {
            setLoading(true);
            fetch('/api/favorites')
                .then(r => r.json())
                .then(({ favorites: rows, folders: folderRows }) => {
                    setFavorites(rows.map((r: any) => JSON.parse(r.recipe_data)));
                    setFolders(folderRows.map((f: any) => ({ id: f.id, name: f.name })));
                    const map: RecipeFolderMap = {};
                    const idMap: Record<string, string> = {};
                    rows.forEach((r: any) => {
                        map[r.recipe_name] = r.folder_id;
                        idMap[r.recipe_name] = r.id;
                    });
                    setRecipeFolderMap(map);
                    setFavoriteIdMap(idMap);
                })
                .finally(() => setLoading(false));
        } else {
            setFavorites(getInitialState('favorites', []));
            setFolders(getInitialState('folders', []));
            setRecipeFolderMap(getInitialState('recipeFolderMap', {}));
            setLoading(false);
        }
    }, [isAuthenticated]);

    // ── localStorage sync (guests only) ───────────────────────────────────
    useEffect(() => {
        if (!loading && !isAuthenticated)
            window.localStorage.setItem('favorites', JSON.stringify(favorites));
    }, [favorites, loading, isAuthenticated]);

    useEffect(() => {
        if (!loading && !isAuthenticated)
            window.localStorage.setItem('folders', JSON.stringify(folders));
    }, [folders, loading, isAuthenticated]);

    useEffect(() => {
        if (!loading && !isAuthenticated)
            window.localStorage.setItem('recipeFolderMap', JSON.stringify(recipeFolderMap));
    }, [recipeFolderMap, loading, isAuthenticated]);

    // ── Mutations ──────────────────────────────────────────────────────────
    const addFavorite = useCallback(async (recipe: GenerateRecipeOutput) => {
        if (isAuthenticated) {
            const res = await fetch('/api/favorites', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ recipe }),
            });
            if (res.ok) {
                const { favorite } = await res.json();
                setFavorites(prev =>
                    prev.some(f => f.recipeName === recipe.recipeName) ? prev : [...prev, recipe]
                );
                setFavoriteIdMap(prev => ({ ...prev, [recipe.recipeName]: favorite.id }));
            }
        } else {
            setFavorites(prev =>
                prev.some(f => f.recipeName === recipe.recipeName) ? prev : [...prev, recipe]
            );
        }
    }, [isAuthenticated]);

    const removeFavorite = useCallback(async (recipeName: string) => {
        if (isAuthenticated) {
            const rowId = favoriteIdMap[recipeName];
            if (rowId) await fetch(`/api/favorites/${rowId}`, { method: 'DELETE' });
        }
        setFavorites(prev => prev.filter(f => f.recipeName !== recipeName));
        setRecipeFolderMap(prev => { const n = { ...prev }; delete n[recipeName]; return n; });
        setFavoriteIdMap(prev => { const n = { ...prev }; delete n[recipeName]; return n; });
    }, [isAuthenticated, favoriteIdMap]);

    const updateFavorite = useCallback((recipeName: string, updatedData: Partial<GenerateRecipeOutput>) => {
        setFavorites(prev =>
            prev.map(f => f.recipeName === recipeName ? { ...f, ...updatedData } : f)
        );
    }, []);

    const isFavorite = useCallback(
        (recipeName: string) => favorites.some(f => f.recipeName === recipeName),
        [favorites]
    );

    const createFolder = useCallback(async (folderName: string) => {
        if (isAuthenticated) {
            const res = await fetch('/api/folders', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: folderName }),
            });
            if (res.ok) {
                const { folder } = await res.json();
                setFolders(prev => [...prev, { id: folder.id, name: folder.name }]);
            }
        } else {
            if (folders.some(f => f.name === folderName)) return;
            setFolders(prev => [...prev, { id: `folder-${Date.now()}`, name: folderName }]);
        }
    }, [isAuthenticated, folders]);

    const deleteFolder = useCallback(async (folderId: string) => {
        if (isAuthenticated) {
            await fetch(`/api/folders/${folderId}`, { method: 'DELETE' });
        }
        setFolders(prev => prev.filter(f => f.id !== folderId));
        setRecipeFolderMap(prev => {
            const n = { ...prev };
            Object.keys(n).forEach(name => { if (n[name] === folderId) n[name] = null; });
            return n;
        });
    }, [isAuthenticated]);

    const moveRecipeToFolder = useCallback(async (recipeName: string, folderId: string | null) => {
        if (isAuthenticated) {
            const rowId = favoriteIdMap[recipeName];
            if (rowId) {
                await fetch(`/api/favorites/${rowId}`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ folderId }),
                });
            }
        }
        setRecipeFolderMap(prev => ({ ...prev, [recipeName]: folderId }));
    }, [isAuthenticated, favoriteIdMap]);

    return {
        favorites, folders, recipeFolderMap, loading,
        addFavorite, removeFavorite, isFavorite,
        createFolder, moveRecipeToFolder, deleteFolder, updateFavorite,
    };
}
