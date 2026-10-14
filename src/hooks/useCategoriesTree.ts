import { useState, useEffect } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase";

export type CategoryAttribute = {
  id: string;
  label: string;
};

export type CategoryBrand = {
  id: string;
  label: string;
  attributes: CategoryAttribute[];
};

export type DynamicCategory = {
  id: string;
  brands: CategoryBrand[];
};

// Normalizer to create safe URL slugs
const normalizeSlug = (text: string) => 
  text.toLowerCase()
      .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

// Maps Firestore category string to our internal category IDs
const mapCategoryToId = (catName: string): string => {
  const norm = normalizeSlug(catName);
  if (norm.includes("monitor")) return "monitores";
  if (norm.includes("case") || norm.includes("gabinete")) return "case";
  if (norm.includes("completa")) return "pc-completa";
  if (norm.includes("ssd") || norm.includes("solido")) return "disco-ssd";
  if (norm.includes("estabilizador")) return "estabilizador";
  if (norm.includes("fuente")) return "fuente-de-poder";
  if (norm.includes("ram")) return "memoria-ram";
  if (norm.includes("periferico") || norm.includes("audifono") || norm.includes("teclado") || norm.includes("mouse")) return "perifericos";
  if (norm.includes("madre") || norm.includes("mother")) return "placa-madre";
  if (norm.includes("video") || norm.includes("grafica") || norm.includes("gpu")) return "tarjetas-de-video";
  if (norm.includes("procesador") || norm.includes("cpu")) return "procesadores";
  if (norm.includes("laptop")) return "laptops";
  if (norm.includes("refrigeracion")) return "refrigeracion";
  return norm;
};

export function useCategoriesTree() {
  const [categoriesTree, setCategoriesTree] = useState<DynamicCategory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTree = async () => {
      try {
        const snapshot = await getDocs(collection(db, "productos"));
        const treeMap: Record<string, Record<string, Set<string>>> = {};

        snapshot.docs.forEach(doc => {
          const data = doc.data();
          const rawCat = data.categoria || data.Categoria || "";
          if (!rawCat) return;

          const catId = mapCategoryToId(String(rawCat));
          
          // Saltar la generación de marcas dinámicas para pc-completa 
          // para preservar las subcategorías estáticas (PC Gamer, etc.)
          if (catId === "pc-completa") return;

          const marca = String(data.marca || data.Marca || "").trim();
          
          // Determine the attribute (e.g. tamaño de pantalla for monitores)
          // You can add more mappings here for other categories
          let attribute = "";
          if (catId === "monitores") {
            attribute = String(data["tamaño de pantalla"] || data["pulgadas"] || data.tamaño || "").trim();
          } else if (catId === "pc-completa" || catId === "laptops") {
            attribute = String(data.procesador || data.Procesador || "").trim();
          } else if (catId === "disco-ssd") {
             attribute = String(data.capacidad || data.Capacidad || "").trim();
          }

          if (!treeMap[catId]) {
            treeMap[catId] = {};
          }
          
          if (marca) {
            const marcaSlug = normalizeSlug(marca);
            if (!treeMap[catId][marcaSlug]) {
              treeMap[catId][marcaSlug] = new Set();
            }
            if (attribute && attribute !== "undefined") {
               treeMap[catId][marcaSlug].add(attribute);
            }
          }
        });

        // Convert Map to Array structure
        const dynamicCategories: DynamicCategory[] = [];
        
        for (const [catId, brandsMap] of Object.entries(treeMap)) {
          const brands: CategoryBrand[] = [];
          for (const [brandSlug, attributesSet] of Object.entries(brandsMap)) {
            const attrs = Array.from(attributesSet).filter(Boolean).map(attr => ({
               id: normalizeSlug(attr),
               label: attr
            }));
            
            // Format brand label nicely
            const brandLabel = brandSlug.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');

            brands.push({
              id: brandSlug,
              label: brandLabel,
              attributes: attrs
            });
          }
          
          if (brands.length > 0) {
             dynamicCategories.push({
               id: catId,
               brands: brands.sort((a,b) => a.label.localeCompare(b.label))
             });
          }
        }

        setCategoriesTree(dynamicCategories);
      } catch (err) {
        console.error("Error fetching categories tree:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchTree();
  }, []);

  return { categoriesTree, loading };
}
