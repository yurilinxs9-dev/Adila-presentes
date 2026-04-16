"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion, AnimatePresence } from "framer-motion";
import { X, User, Phone, ArrowRight, Loader2, CheckCircle, Lock } from "lucide-react";

const schema = z.object({
  nome_completo: z.string().min(3, "Nome deve ter pelo menos 3 caracteres"),
  celular: z.string().regex(/^\(\d{2}\) \d{5}-\d{4}$/, "Formato: (XX) XXXXX-XXXX"),
});

type FormData = z.infer<typeof schema>;

function formatPhone(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 11);
  if (digits.length <= 2) return digits.length ? `(${digits}` : "";
  if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}

interface LeadFormModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function LeadFormModal({ isOpen, onClose }: LeadFormModalProps) {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      setTimeout(() => {
        setStatus("idle");
        setErrorMsg("");
        reset();
      }, 300);
    }
  }, [isOpen, reset]);

  const onSubmit = async (data: FormData) => {
    setStatus("loading");
    setErrorMsg("");
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || "Erro ao cadastrar");
      }
      setStatus("success");
      setTimeout(() => {
        window.location.href = "https://chat.whatsapp.com/DfzeafadOra4uczlKwQz4I";
      }, 1500);
    } catch (err) {
      setStatus("error");
      setErrorMsg(err instanceof Error ? err.message : "Erro inesperado. Tente novamente.");
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-backdrop"
          onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 20 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-full max-w-md"
          >
            {/* Modal card */}
            <div className="glass-card p-8 md:p-10 border border-white/[0.08] shadow-2xl shadow-black/60">
              {/* Close button */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 transition-colors cursor-pointer"
                aria-label="Fechar"
              >
                <X className="w-4 h-4 text-white/40" />
              </button>

              {status === "success" ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-6"
                >
                  <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto mb-5">
                    <CheckCircle className="w-8 h-8 text-emerald-400" />
                  </div>
                  <p className="text-xl font-display font-bold text-white mb-2">
                    Cadastro realizado!
                  </p>
                  <p className="text-white/40 text-sm font-body">
                    Redirecionando para o grupo VIP...
                  </p>
                </motion.div>
              ) : (
                <>
                  {/* Header */}
                  <div className="text-center mb-8">
                    <h3 className="font-display text-2xl md:text-3xl font-bold text-white mb-2">
                      Garanta seu <span className="text-accent">Acesso VIP</span>
                    </h3>
                    <p className="text-white/35 text-sm font-body">
                      Preencha os dados e entre no grupo exclusivo
                    </p>
                  </div>

                  {/* Form */}
                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                    {/* Nome */}
                    <div>
                      <div className="relative">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/25" />
                        <input
                          {...register("nome_completo")}
                          type="text"
                          placeholder="Seu nome completo"
                          className="w-full pl-11 pr-4 py-3.5 bg-white/[0.04] border border-white/[0.08] rounded-xl text-white placeholder-white/25 text-sm font-body focus:outline-none focus:border-accent/40 transition-colors"
                        />
                      </div>
                      {errors.nome_completo && (
                        <p className="text-red-400/80 text-xs mt-1.5 ml-1">{errors.nome_completo.message}</p>
                      )}
                    </div>

                    {/* Celular */}
                    <div>
                      <div className="relative">
                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/25" />
                        <input
                          {...register("celular")}
                          type="tel"
                          placeholder="(XX) XXXXX-XXXX"
                          onChange={(e) => {
                            const formatted = formatPhone(e.target.value);
                            setValue("celular", formatted, { shouldValidate: false });
                            e.target.value = formatted;
                          }}
                          className="w-full pl-11 pr-4 py-3.5 bg-white/[0.04] border border-white/[0.08] rounded-xl text-white placeholder-white/25 text-sm font-body focus:outline-none focus:border-accent/40 transition-colors"
                        />
                      </div>
                      {errors.celular && (
                        <p className="text-red-400/80 text-xs mt-1.5 ml-1">{errors.celular.message}</p>
                      )}
                    </div>

                    {/* Error message */}
                    {status === "error" && (
                      <p className="text-red-400/80 text-xs text-center">{errorMsg}</p>
                    )}

                    {/* Submit */}
                    <button
                      type="submit"
                      disabled={status === "loading"}
                      className="w-full btn-primary text-white font-body font-semibold text-sm py-4 rounded-xl flex items-center justify-center gap-2 cursor-pointer tracking-wider uppercase disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {status === "loading" ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <>
                          Entrar no Grupo VIP
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </form>

                  {/* Security badge */}
                  <p className="text-white/15 text-xs text-center mt-6 flex items-center justify-center gap-1.5 font-body">
                    <Lock className="w-3 h-3" /> Seus dados estão seguros
                  </p>
                </>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
