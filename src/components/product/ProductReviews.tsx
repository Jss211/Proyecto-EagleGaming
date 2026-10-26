import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { db, auth } from "../../firebase";
import { collection, query, where, addDoc, serverTimestamp } from "firebase/firestore";
import { onAuthStateChanged, type User as FirebaseUser } from "firebase/auth";
import { Star, ShieldCheck, Lock } from "lucide-react";
import { AnimatedButton } from "../ui/AnimatedButton";
import { TestimonialsSection } from "../ui/simple-animated-testimonials";
import { getUserDisplayName } from "../../utils/userProfile";

interface Review {
  id: string;
  productId: string;
  userName: string;
  rating: number;
  valueRating?: number;
  durabilityRating?: number;
  deliveryRating?: number;
  comment: string;
  createdAt: any;
  avatar?: string;
}

export function ProductReviewForm({ productId }: { productId: string }) {
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  
  const [valueRating, setValueRating] = useState(0);
  const [hoverValueRating, setHoverValueRating] = useState(0);

  const [durabilityRating, setDurabilityRating] = useState(0);
  const [hoverDurabilityRating, setHoverDurabilityRating] = useState(0);

  const [deliveryRating, setDeliveryRating] = useState(0);
  const [hoverDeliveryRating, setHoverDeliveryRating] = useState(0);

  const [comment, setComment] = useState("");
  const [userName, setUserName] = useState("");
  const [userAvatar, setUserAvatar] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      if (user) {
        const resolvedName = getUserDisplayName(user);
        setUserName(resolvedName);
        if (user.photoURL) setUserAvatar(user.photoURL);
      } else {
        setUserName("");
        setUserAvatar(null);
      }
      setAuthChecked(true);
    });
    return () => unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      alert("Debes iniciar sesión con tu cuenta para publicar una reseña.");
      return;
    }

    const finalName = getUserDisplayName(currentUser) || userName.trim();
    if (!finalName || !comment.trim() || rating === 0) {
      alert("Por favor, completa tu reseña y al menos la puntuación general.");
      return;
    }

    setSubmitting(true);
    try {
      await addDoc(collection(db, "reviews"), {
        productId,
        userName: finalName,
        userId: currentUser.uid,
        userEmail: currentUser.email || "",
        rating,
        valueRating,
        durabilityRating,
        deliveryRating,
        comment,
        avatar: userAvatar,
        createdAt: serverTimestamp()
      });
      setComment("");
      setRating(0);
      setValueRating(0);
      setDurabilityRating(0);
      setDeliveryRating(0);
    } catch (error) {
      console.error("Error adding review:", error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ marginTop: "3rem", borderTop: "1px solid #eaeaea", paddingTop: "2rem", width: "100%" }}>
      <h3 style={{ fontSize: "1.3rem", fontWeight: "700", marginBottom: "1.5rem", fontFamily: "var(--font-display)", color: "#111", textTransform: "uppercase" }}>
        Reseñas de clientes
      </h3>

      <div className="product-review-form-card" style={{ background: "#f9fafb", padding: "2rem", borderRadius: "8px", border: "1px solid #f3f4f6" }}>
        <h4 style={{ fontSize: "1.2rem", fontWeight: "600", marginBottom: "1.5rem", color: "#333" }}>Escribe una reseña</h4>

        {authChecked && !currentUser ? (
          <div style={{ background: "#fff", border: "1px dashed #cbd5e1", borderRadius: "8px", padding: "1.5rem", textAlign: "center" }}>
            <ShieldCheck size={36} color="#059669" style={{ margin: "0 auto 0.75rem" }} />
            <p style={{ fontSize: "0.95rem", fontWeight: "600", color: "#1e293b", marginBottom: "0.4rem" }}>
              Reseñas de Clientes Verificados
            </p>
            <p style={{ fontSize: "0.85rem", color: "#64748b", marginBottom: "1.25rem", maxWidth: "420px", marginLeft: "auto", marginRight: "auto" }}>
              Para asegurar la autenticidad y que las opiniones muestren el nombre real de quien se registró, inicia sesión con tu cuenta.
            </p>
            <Link
              to="/login"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.5rem",
                background: "#111",
                color: "#fff",
                padding: "0.6rem 1.4rem",
                borderRadius: "8px",
                fontSize: "0.85rem",
                fontWeight: 700,
                textDecoration: "none",
                transition: "background 0.2s",
              }}
              onMouseOver={(e) => (e.currentTarget.style.background = "#e81950")}
              onMouseOut={(e) => (e.currentTarget.style.background = "#111")}
            >
              Iniciar sesión para opinar
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.8rem", marginBottom: "0.5rem" }}>
              
              {/* Tu puntuación */}
              <div className="product-review-rating-row" style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "0.5rem" }}>
                <label style={{ fontSize: "0.95rem", color: "#333", minWidth: "140px" }}>Tu puntuación <span style={{ color: "red" }}>*</span> :</label>
                <div style={{ display: "flex", gap: "4px" }}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button key={star} type="button" onClick={() => setRating(star)} onMouseEnter={() => setHoverRating(star)} onMouseLeave={() => setHoverRating(0)} style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }}>
                      <Star fill={(hoverRating || rating) >= star ? "#fbbf24" : "transparent"} color={(hoverRating || rating) >= star ? "#fbbf24" : "#cbd5e1"} size={22} />
                    </button>
                  ))}
                </div>
              </div>

              {/* Value for money */}
              <div className="product-review-rating-row" style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "0.5rem" }}>
                <label style={{ fontSize: "0.95rem", color: "#333", minWidth: "140px" }}>Calidad-Precio :</label>
                <div style={{ display: "flex", gap: "4px" }}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button key={star} type="button" onClick={() => setValueRating(star)} onMouseEnter={() => setHoverValueRating(star)} onMouseLeave={() => setHoverValueRating(0)} style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }}>
                      <Star fill={(hoverValueRating || valueRating) >= star ? "#fbbf24" : "transparent"} color={(hoverValueRating || valueRating) >= star ? "#fbbf24" : "#cbd5e1"} size={22} />
                    </button>
                  ))}
                </div>
              </div>

              {/* Durability */}
              <div className="product-review-rating-row" style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "0.5rem" }}>
                <label style={{ fontSize: "0.95rem", color: "#333", minWidth: "140px" }}>Durabilidad :</label>
                <div style={{ display: "flex", gap: "4px" }}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button key={star} type="button" onClick={() => setDurabilityRating(star)} onMouseEnter={() => setHoverDurabilityRating(star)} onMouseLeave={() => setHoverDurabilityRating(0)} style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }}>
                      <Star fill={(hoverDurabilityRating || durabilityRating) >= star ? "#fbbf24" : "transparent"} color={(hoverDurabilityRating || durabilityRating) >= star ? "#fbbf24" : "#cbd5e1"} size={22} />
                    </button>
                  ))}
                </div>
              </div>

              {/* Delivery speed */}
              <div className="product-review-rating-row" style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "0.5rem" }}>
                <label style={{ fontSize: "0.95rem", color: "#333", minWidth: "140px" }}>Velocidad envío :</label>
                <div style={{ display: "flex", gap: "4px" }}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button key={star} type="button" onClick={() => setDeliveryRating(star)} onMouseEnter={() => setHoverDeliveryRating(star)} onMouseLeave={() => setHoverDeliveryRating(0)} style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }}>
                      <Star fill={(hoverDeliveryRating || deliveryRating) >= star ? "#fbbf24" : "transparent"} color={(hoverDeliveryRating || deliveryRating) >= star ? "#fbbf24" : "#cbd5e1"} size={22} />
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Nombre del usuario bloqueado a la cuenta registrada */}
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
                <label style={{ fontSize: "0.9rem", color: "#333", fontWeight: "600" }}>Publicando como:</label>
                <span style={{ fontSize: "0.78rem", color: "#059669", fontWeight: 700, display: "flex", alignItems: "center", gap: "4px" }}>
                  <ShieldCheck size={15} /> Cliente verificado
                </span>
              </div>
              <div style={{ position: "relative" }}>
                <input 
                  type="text" 
                  readOnly
                  disabled
                  value={userName}
                  style={{ 
                    width: "100%", 
                    padding: "0.8rem", 
                    paddingLeft: "2.4rem",
                    border: "1px solid #cbd5e1", 
                    borderRadius: "6px", 
                    outline: "none", 
                    fontSize: "0.95rem",
                    backgroundColor: "#f1f5f9",
                    color: "#0f172a",
                    fontWeight: 600,
                    cursor: "not-allowed",
                    boxSizing: "border-box"
                  }} 
                />
                <Lock size={15} color="#64748b" style={{ position: "absolute", left: "0.85rem", top: "50%", transform: "translateY(-50%)" }} />
              </div>
              <p style={{ fontSize: "0.75rem", color: "#64748b", marginTop: "0.4rem" }}>
                Tu reseña se publicará con el nombre de tu cuenta registrada{currentUser?.email ? ` (${currentUser.email})` : ""}. No se puede alterar para garantizar opiniones auténticas.
              </p>
            </div>

            <div>
              <label style={{ display: "block", fontSize: "0.9rem", color: "#555", marginBottom: "0.5rem", fontWeight: "500" }}>Tu reseña</label>
              <textarea 
                required 
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={4} 
                style={{ width: "100%", padding: "0.8rem", border: "1px solid #ddd", borderRadius: "4px", outline: "none", fontSize: "0.95rem", resize: "vertical", boxSizing: "border-box" }} 
                placeholder="Escribe tu opinión sobre el producto..."
              />
            </div>

            <div style={{ marginTop: "0.5rem" }}>
              <AnimatedButton type="submit" disabled={submitting} className={submitting ? "opacity-50 cursor-not-allowed" : ""}>
                {submitting ? "ENVIANDO..." : "PUBLICAR RESEÑA"}
              </AnimatedButton>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

import { onSnapshot } from "firebase/firestore";

export function ProductReviewList({ productId }: { productId: string }) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(
      collection(db, "reviews"),
      where("productId", "==", productId)
    );
    
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const fetchedReviews: Review[] = [];
      querySnapshot.forEach((doc) => {
        fetchedReviews.push({ id: doc.id, ...doc.data() } as Review);
      });
      
      // Ordenar en memoria para evitar el error de índice faltante en Firestore
      fetchedReviews.sort((a, b) => {
        const timeA = a.createdAt?.toMillis ? a.createdAt.toMillis() : (a.createdAt?.seconds ? a.createdAt.seconds * 1000 : 0);
        const timeB = b.createdAt?.toMillis ? b.createdAt.toMillis() : (b.createdAt?.seconds ? b.createdAt.seconds * 1000 : 0);
        return timeB - timeA;
      });

      setReviews(fetchedReviews);
      setLoading(false);
    }, (error) => {
      // Solo loguear si no es error de permisos (normal si aun no hay resenas)
      if ((error as { code?: string }).code !== "permission-denied") {
        console.error("Error fetching reviews:", error);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [productId]);

  const averageRating = reviews.length > 0 
    ? (reviews.reduce((acc, curr) => acc + curr.rating, 0) / reviews.length).toFixed(1)
    : 0;

  return (
    <div style={{ width: "100%", marginTop: "3rem", borderTop: "1px solid transparent", paddingTop: "2rem" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "2rem" }}>
        <div style={{ display: "flex", alignItems: "center" }}>
          {[1, 2, 3, 4, 5].map((star) => (
            <Star 
              key={star}
              fill={Number(averageRating) >= star ? "#fbbf24" : "transparent"} 
              color={Number(averageRating) >= star ? "#fbbf24" : "#cbd5e1"} 
              size={24} 
            />
          ))}
        </div>
        <span style={{ fontSize: "1.1rem", fontWeight: "600", color: "#333" }}>{averageRating} de 5</span>
        <span style={{ fontSize: "0.9rem", color: "#777" }}>({reviews.length} {reviews.length === 1 ? 'reseña' : 'reseñas'})</span>
      </div>

      {loading ? (
        <p style={{ color: "#777" }}>Cargando reseñas...</p>
      ) : (
        <TestimonialsSection 
          testimonials={reviews.map(r => {
            const dateObj = r.createdAt?.toDate ? r.createdAt.toDate() : (r.createdAt?.seconds ? new Date(r.createdAt.seconds * 1000) : new Date());
            return {
              id: r.id,
              name: r.userName,
              content: r.comment,
              rating: r.rating,
              avatar: r.avatar,
              createdAt: dateObj
            };
          })}
        />
      )}
    </div>
  );
}
